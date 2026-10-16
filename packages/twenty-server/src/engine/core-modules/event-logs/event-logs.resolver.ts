/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';
import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { EventLogsGraphqlApiExceptionFilter } from 'src/engine/core-modules/event-logs/filters/event-logs-graphql-api-exception.filter';
import { ForbiddenExceptionGraphqlFilter } from 'src/engine/core-modules/event-logs/filters/forbidden-exception-graphql.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthIsUserSession } from 'src/engine/decorators/auth/auth-is-user-session.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

import { EventLogQueryInput } from './dtos/event-log-query.input';
import { EventLogQueryResult } from './dtos/event-log-result.dto';
import { EventLogsService } from './event-logs.service';

@MetadataResolver()
@UseFilters(
  ForbiddenExceptionGraphqlFilter,
  AuthGraphqlApiExceptionFilter,
  EventLogsGraphqlApiExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UsePipes(ResolverValidationPipe)
export class EventLogsResolver {
  constructor(private readonly eventLogsService: EventLogsService) {}

  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    }),
    SettingsPermissionGuard(PermissionFlagType.SECURITY),
  )
  @Query(() => EventLogQueryResult)
  async eventLogs(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: EventLogQueryInput,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthIsUserSession() isUserSession: boolean,
  ): Promise<EventLogQueryResult> {
    return this.eventLogsService.queryEventLogs(workspace, input, {
      callingApplicationId: getScopedCallingApplication(callingApplication)?.id,
      user: isUserSession ? user : undefined,
    });
  }
}
