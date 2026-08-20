import { UseFilters, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { type LogicFunctionTriggeredBy } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { LogicFunctionTriggeredByDto } from 'src/engine/core-modules/application/application-triggered-by/dtos/logic-function-triggered-by.dto';
import { ApplicationTriggeredByService } from 'src/engine/core-modules/application/application-triggered-by/services/application-triggered-by.service';
import { resolveApplicationTriggeredBy } from 'src/engine/core-modules/application/application-triggered-by/utils/resolve-application-triggered-by.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ApplicationTriggeredBy } from 'src/engine/core-modules/auth/types/application-triggered-by.type';
import { type FlatAuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplicationTriggeredBy } from 'src/engine/decorators/auth/auth-application-triggered-by.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UseFilters(ApplicationExceptionFilter)
@MetadataResolver()
export class ApplicationTriggeredByResolver {
  constructor(
    private readonly applicationTriggeredByService: ApplicationTriggeredByService,
  ) {}

  // Takes no argument on purpose: the identity comes from the token, so an
  // application can only ever ask about the run it was handed.
  @Query(() => LogicFunctionTriggeredByDto, { nullable: true })
  async logicFunctionTriggeredBy(
    @AuthApplication() _application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplicationTriggeredBy()
    applicationTriggeredBy: ApplicationTriggeredBy | undefined,
    @AuthUser({ allowUndefined: true }) user: FlatAuthContextUser | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    tokenUserWorkspaceId: string | undefined,
  ): Promise<LogicFunctionTriggeredBy | null> {
    const triggeredBy = resolveApplicationTriggeredBy({
      applicationTriggeredBy,
      tokenUserId: user?.id,
      tokenUserWorkspaceId,
    });

    if (!isDefined(triggeredBy)) {
      return null;
    }

    return this.applicationTriggeredByService.describe({
      triggeredBy,
      workspaceId: workspace.id,
    });
  }
}
