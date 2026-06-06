import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Subscription } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { EventLogTable } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { EventLogsGraphqlApiExceptionFilter } from 'src/engine/core-modules/event-logs/filters/event-logs-graphql-api-exception.filter';
import { ForbiddenExceptionGraphqlFilter } from 'src/engine/core-modules/event-logs/filters/forbidden-exception-graphql.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { APPLICATION_KEEPALIVE_INTERVAL_MS } from 'src/engine/subscriptions/constants/application-keepalive-interval-ms.constant';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';
import { EventLogLiveService } from 'src/engine/core-modules/event-logs/live/event-log-live.service';

import { EventLogsService } from './event-logs.service';

import { EventLogRecord } from './dtos/event-log-result.dto';
import { getClickHouseTableName } from './registry/event-log-registry';
import { normalizeEventLogRecords } from './utils/normalize-event-log-records';

type WorkspaceEventLivePayload = {
  table: string;
  rows: Record<string, unknown>[];
};

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
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.SECURITY),
  )
  @Subscription(() => [EventLogRecord], {
    nullable: true,
    filter: (
      payload: WorkspaceEventLivePayload,
      variables: { table: EventLogTable },
    ) => getClickHouseTableName(variables.table) === payload.table,
    resolve: (
      payload: WorkspaceEventLivePayload,
      variables: { table: EventLogTable },
    ) => normalizeEventLogRecords(payload.rows, variables.table),
  })
  async eventLogsLive(
    @Args('table', { type: () => EventLogTable }) table: EventLogTable,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    await this.eventLogsService.validateAccess(workspace.id, table);

    const clickHouseTable = getClickHouseTableName(table);

    await this.workspaceEventLiveService.markWatched(
      workspace.id,
      clickHouseTable,
    );

    const iterator = await this.subscriptionService.subscribe({
      channel: SubscriptionChannel.WORKSPACE_EVENTS_CHANNEL,
      workspaceId: workspace.id,
    });

    return wrapAsyncIteratorWithLifecycle(iterator, {
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
