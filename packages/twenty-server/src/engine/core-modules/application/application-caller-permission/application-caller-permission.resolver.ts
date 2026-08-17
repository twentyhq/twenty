import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UseFilters(ApplicationExceptionFilter)
@MetadataResolver()
export class ApplicationCallerPermissionResolver {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Query(() => Boolean)
  async appCallerHasPermissionFlag(
    @AuthApplication() _application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @Args('permissionFlag', { type: () => PermissionFlagType })
    permissionFlag: PermissionFlagType,
    @Args('userWorkspaceId', { nullable: true })
    userWorkspaceId?: string,
    @Args('apiKeyId', { nullable: true })
    apiKeyId?: string,
  ): Promise<boolean> {
    if (!userWorkspaceId && !apiKeyId) {
      return false;
    }

    return this.permissionsService.userHasWorkspaceSettingPermission({
      userWorkspaceId,
      apiKeyId,
      workspaceId: workspace.id,
      setting: permissionFlag,
    });
  }
}
