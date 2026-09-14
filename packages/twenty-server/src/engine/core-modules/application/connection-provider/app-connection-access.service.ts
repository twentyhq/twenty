import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { getConnectedAccountAdministrationPermissionFlag } from 'src/engine/metadata-modules/connected-account/utils/get-connected-account-administration-permission-flag.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class AppConnectionAccessService {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Every member may use a workspace-shared connection, but creating, repairing
  // or removing one is an Applications settings action: it decides what
  // credentials the whole workspace runs on. A private connection stays under
  // its owner's control, which is what keeps personal email and calendar
  // accounts manageable without the settings permission.
  async validateCallerCanManageConnection({
    isWorkspaceShared,
    workspaceId,
    userWorkspaceId,
    apiKeyId,
    applicationId,
  }: {
    isWorkspaceShared: boolean;
    workspaceId: string;
    userWorkspaceId?: string;
    apiKeyId?: string;
    applicationId?: string;
  }): Promise<void> {
    if (!isWorkspaceShared) {
      return;
    }

    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: getConnectedAccountAdministrationPermissionFlag(
          ConnectedAccountProvider.APP,
        ),
        apiKeyId,
        applicationId,
      });

    if (!hasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`You do not have permission to manage connections shared with the workspace. Please contact your workspace administrator for access.`,
        },
      );
    }
  }
}
