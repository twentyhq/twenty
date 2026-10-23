import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  mixin,
  SetMetadata,
  type Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SETTINGS_PERMISSION_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/settings-permission-guard-config-key.constant';
import { buildPermissionFlagDeniedException } from 'src/engine/guards/utils/build-permission-flag-denied-exception.util';
import { PermissionsService } from 'src/engine/permissions/permissions.service';

export const SettingsPermissionGuard = (
  requiredPermissions: PermissionFlagType | PermissionFlagType[],
): Type<CanActivate> => {
  const requiredPermissionFlags = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  @Injectable()
  @SetMetadata(SETTINGS_PERMISSION_GUARD_CONFIG_KEY, requiredPermissionFlags)
  class SettingsPermissionMixin implements CanActivate {
    constructor(private readonly permissionsService: PermissionsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const workspaceId = ctx.getContext().req.workspace.id;
      const userWorkspaceId = ctx.getContext().req.userWorkspaceId;
      const workspaceActivationStatus =
        ctx.getContext().req.workspace.activationStatus;

      if (
        [
          WorkspaceActivationStatus.PENDING_CREATION,
          WorkspaceActivationStatus.ONGOING_CREATION,
        ].includes(workspaceActivationStatus)
      ) {
        return true;
      }

      for (const setting of requiredPermissionFlags) {
        const hasPermission =
          await this.permissionsService.userHasWorkspaceSettingPermission({
            userWorkspaceId,
            setting,
            workspaceId,
            apiKeyId: ctx.getContext().req.apiKey?.id,
            applicationId: ctx.getContext().req.application?.id,
            agentId: ctx.getContext().req.agentId,
          });

        if (!hasPermission) {
          throw buildPermissionFlagDeniedException();
        }
      }

      return true;
    }
  }

  return mixin(SettingsPermissionMixin);
};
