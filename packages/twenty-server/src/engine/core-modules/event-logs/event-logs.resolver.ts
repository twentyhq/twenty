/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { EventLogsGraphqlApiExceptionFilter } from 'src/engine/core-modules/event-logs/filters/event-logs-graphql-api-exception.filter';
import { ForbiddenExceptionGraphqlFilter } from 'src/engine/core-modules/event-logs/filters/forbidden-exception-graphql.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getReachableApplications } from 'src/engine/core-modules/application/utils/get-reachable-applications.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';

import { EventLogsService } from './event-logs.service';

import { EventLogQueryInput } from './dtos/event-log-query.input';
import { EventLogQueryResult } from './dtos/event-log-result.dto';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@MetadataResolver()
@UseFilters(
  ForbiddenExceptionGraphqlFilter,
  AuthGraphqlApiExceptionFilter,
  EventLogsGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UsePipes(ResolverValidationPipe)
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [PermissionFlagType.SECURITY],
  }),
)
export class EventLogsResolver {
  constructor(private readonly eventLogsService: EventLogsService) {}

  @Query(() => EventLogQueryResult)
  async eventLogs(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: EventLogQueryInput,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<EventLogQueryResult> {
    return this.eventLogsService.queryEventLogs(workspace, input, {
      reachableApplications: getReachableApplications({
        callingApplication,
        operation: 'read',
        workspaceCustomApplicationId: workspace.workspaceCustomApplicationId,
      }),
    });
  }
}
