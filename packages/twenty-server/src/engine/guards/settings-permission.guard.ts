import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  mixin,
  type Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
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
      const request = GqlExecutionContext.create(context).getContext().req;

      const hasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermissionOrWorkspaceIsBeingCreated(
          {
            workspace: request.workspace,
            userWorkspaceId: request.userWorkspaceId,
            setting: requiredPermission,
            apiKeyId: request.apiKey?.id,
            applicationId: request.application?.id,
          },
        );

      if (hasPermission) {
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
