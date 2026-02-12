import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'class-validator';
import { PermissionFlagType } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class UploadProfilePicturePermissionGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

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

    const workspaceId = request.workspace.id;
    const userWorkspaceId = request.userWorkspaceId;
    const workspaceActivationStatus = request.workspace.activationStatus;
    const apiKeyId = request.apiKey?.id;

    // Allow during workspace creation
    if (
      [
        WorkspaceActivationStatus.PENDING_CREATION,
        WorkspaceActivationStatus.ONGOING_CREATION,
      ].includes(workspaceActivationStatus)
    ) {
      return true;
    }

    // Check if user has WORKSPACE_MEMBERS permission (can edit any profile picture)
    const hasWorkspaceMembersPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: PermissionFlagType.WORKSPACE_MEMBERS,
        apiKeyId,
      });

    if (hasWorkspaceMembersPermission) {
      return true;
    }

    // Check if user has PROFILE_INFORMATION permission (can edit their own profile picture)
    const hasProfileInformationPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: PermissionFlagType.PROFILE_INFORMATION,
        apiKeyId,
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
