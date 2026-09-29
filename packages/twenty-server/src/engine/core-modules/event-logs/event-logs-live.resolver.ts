import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Subscription } from '@nestjs/graphql';

import { isString } from '@sniptt/guards';
import { PermissionFlagType } from 'twenty-shared/constants';
import { EventLogTable } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { EventLogsGraphqlApiExceptionFilter } from 'src/engine/core-modules/event-logs/filters/event-logs-graphql-api-exception.filter';
import { ForbiddenExceptionGraphqlFilter } from 'src/engine/core-modules/event-logs/filters/forbidden-exception-graphql.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { CallerGuard } from 'src/engine/guards/caller.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { APPLICATION_KEEPALIVE_INTERVAL_MS } from 'src/engine/subscriptions/constants/application-keepalive-interval-ms.constant';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
import { EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';

import { EventLogsService } from './event-logs.service';

import { EventLogFieldFilterInput } from './dtos/event-log-field-filter.input';
import { EventLogRecord } from './dtos/event-log-result.dto';
import { getClickHouseTableName } from './registry/event-log-registry';
import { isEventLogRowMatchingFieldFilters } from './utils/is-event-log-row-matching-field-filters.util';
import { normalizeEventLogRecords } from './utils/normalize-event-log-records';
import { validateEventLogFieldFilterOrThrow } from './utils/validate-event-log-field-filter-or-throw.util';

type WorkspaceEventLivePayload = {
  table: string;
  rows: Record<string, unknown>[];
};

type EventLogsLiveVariables = {
  table: EventLogTable;
  fieldFilters?: EventLogFieldFilterInput[];
};

const isRowMatchingVariables = ({
  row,
  variables,
}: {
  row: Record<string, unknown>;
  variables: EventLogsLiveVariables;
}): boolean =>
  isEventLogRowMatchingFieldFilters({
    row,
    fieldFilters: variables.fieldFilters ?? [],
  });

@MetadataResolver()
@UseFilters(
  ForbiddenExceptionGraphqlFilter,
  AuthGraphqlApiExceptionFilter,
  EventLogsGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UsePipes(ResolverValidationPipe)
export class EventLogsLiveResolver {
  constructor(
    private readonly eventLogsService: EventLogsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly workspaceEventLiveService: EventLogLiveService,
  ) {}

  @UseGuards(
    CallerGuard({
      userSession: true,
      apiKey: true,
      oauthClient: true,
      application: true,
    }),
    SettingsPermissionGuard(PermissionFlagType.SECURITY),
  )
  @Subscription(() => [EventLogRecord], {
    nullable: true,
    filter: (
      payload: WorkspaceEventLivePayload,
      variables: EventLogsLiveVariables,
    ) =>
      getClickHouseTableName(variables.table) === payload.table &&
      payload.rows.some((row) => isRowMatchingVariables({ row, variables })),
    resolve: (
      payload: WorkspaceEventLivePayload,
      variables: EventLogsLiveVariables,
    ) =>
      normalizeEventLogRecords(
        payload.rows.filter((row) =>
          isRowMatchingVariables({ row, variables }),
        ),
        variables.table,
      ),
  })
  async eventLogsLive(
    @Args('table', { type: () => EventLogTable }) table: EventLogTable,
    @Args('fieldFilters', {
      type: () => [EventLogFieldFilterInput],
      nullable: true,
    })
    fieldFilters: EventLogFieldFilterInput[] | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    await this.eventLogsService.validateAccess(workspace.id, table);

    fieldFilters?.forEach((fieldFilter) =>
      validateEventLogFieldFilterOrThrow({ fieldFilter, table }),
    );

    const clickHouseTable = getClickHouseTableName(table);

    await this.workspaceEventLiveService.markWatched(
      workspace.id,
      clickHouseTable,
    );

    const iterator =
      await this.subscriptionService.subscribe<WorkspaceEventLivePayload>({
        channel: SubscriptionChannel.WORKSPACE_EVENTS_CHANNEL,
        workspaceId: workspace.id,
        mapPayload: (payload) => {
          if (
            payload.table !==
            getClickHouseTableName(EventLogTable.APPLICATION_LOG)
          ) {
            return payload;
          }

          const rows = payload.rows.filter((row) =>
            canCallerReachApplication({
              callingApplication,
              applicationId: isString(row.applicationId)
                ? row.applicationId
                : undefined,
            }),
          );

          return isNonEmptyArray(rows) ? { ...payload, rows } : undefined;
        },
      });

    return wrapAsyncIteratorWithLifecycle(() => iterator, {
      onHeartbeat: async () => {
        await this.workspaceEventLiveService.markWatched(
          workspace.id,
          clickHouseTable,
        );

        return true;
      },
      heartbeatIntervalMs: APPLICATION_KEEPALIVE_INTERVAL_MS,
    });
  }
}
