import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  mixin,
  type Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type PermissionFlagType } from 'twenty-shared/constants';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

export const SettingsPermissionGuard = (
  requiredPermission: PermissionFlagType,
): Type<CanActivate> => {
  @Injectable()
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

      const hasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId,
          setting: requiredPermission,
          workspaceId,
          apiKeyId: ctx.getContext().req.apiKey?.id,
        });

      if (hasPermission === true) {
        return true;
      }

      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`You do not have permission to access this feature. Please contact your workspace administrator for access.`,
        },
      );
    }
  }

  return mixin(SettingsPermissionMixin);
};
