import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { type LogicFunctionInvokingUser } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { resolveInvokingUserWorkspaceId } from 'src/engine/core-modules/application/application-invoking-user-permission/utils/resolve-invoking-user-workspace-id.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplicationInvokingUser } from 'src/engine/decorators/auth/auth-application-invoking-user.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UseFilters(ApplicationExceptionFilter)
@MetadataResolver()
export class ApplicationInvokingUserPermissionResolver {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Query(() => Boolean)
  async invokingUserHasPermissionFlag(
    @AuthApplication() _application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplicationInvokingUser()
    invokingUser: LogicFunctionInvokingUser | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    tokenUserWorkspaceId: string | undefined,
    @Args('permissionFlag', { type: () => PermissionFlagType })
    permissionFlag: PermissionFlagType,
  ): Promise<boolean> {
    const userWorkspaceId = resolveInvokingUserWorkspaceId({
      invokingUser,
      tokenUserWorkspaceId,
    });

    if (!isDefined(userWorkspaceId)) {
      return false;
    }

    return this.permissionsService.userHasWorkspaceSettingPermission({
      userWorkspaceId,
      workspaceId: workspace.id,
      setting: permissionFlag,
    });
  }
}
