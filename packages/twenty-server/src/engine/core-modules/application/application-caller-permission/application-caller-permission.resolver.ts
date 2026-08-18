import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { type LogicFunctionCaller } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { resolveApplicationCallerIdentity } from 'src/engine/core-modules/application/application-caller-permission/utils/resolve-application-caller-identity.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplicationCaller } from 'src/engine/decorators/auth/auth-application-caller.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UseFilters(ApplicationExceptionFilter)
@MetadataResolver()
export class ApplicationCallerPermissionResolver {
  constructor(private readonly permissionsService: PermissionsService) {}

  // The identity being checked comes from the application access token, never
  // from the request: an application cannot ask about someone it did not serve.
  @Query(() => Boolean)
  async appCallerHasPermissionFlag(
    @AuthApplication() _application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplicationCaller() caller: LogicFunctionCaller | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    tokenUserWorkspaceId: string | undefined,
    @Args('permissionFlag', { type: () => PermissionFlagType })
    permissionFlag: PermissionFlagType,
  ): Promise<boolean> {
    const callerIdentity = resolveApplicationCallerIdentity({
      caller,
      tokenUserWorkspaceId,
    });

    if (!isDefined(callerIdentity)) {
      return false;
    }

    return this.permissionsService.userHasWorkspaceSettingPermission({
      ...callerIdentity,
      workspaceId: workspace.id,
      setting: permissionFlag,
    });
  }
}
