import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { buildWorkspaceAuthContextFromRequest } from 'src/engine/core-modules/auth/utils/build-workspace-auth-context-from-request.util';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'class-validator';
import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

@Injectable()
export class UploadProfilePicturePermissionGuard implements CanActivate {
  constructor(
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    if (!isDefined(request.workspace)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`Workspace not found`,
        },
      );
    }

    const workspaceActivationStatus = request.workspace.activationStatus;

    if (
      [
        WorkspaceActivationStatus.PENDING_CREATION,
        WorkspaceActivationStatus.ONGOING_CREATION,
      ].includes(workspaceActivationStatus)
    ) {
      return true;
    }

    const authContext = buildWorkspaceAuthContextFromRequest(request);

    const hasWorkspaceMembersPermission =
      await this.settingPermissionsService.hasPermissionFlag({
        authContext: authContext,
        permissionFlag: PermissionFlagType.WORKSPACE_MEMBERS,
      });

    if (hasWorkspaceMembersPermission) {
      return true;
    }

    const hasProfileInformationPermission =
      await this.settingPermissionsService.hasPermissionFlag({
        authContext: authContext,
        permissionFlag: PermissionFlagType.PROFILE_INFORMATION,
      });

    if (hasProfileInformationPermission) {
      return true;
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
      {
        userFriendlyMessage: msg`You do not have permission to upload profile pictures. Please contact your workspace administrator for access.`,
      },
    );
  }
}
