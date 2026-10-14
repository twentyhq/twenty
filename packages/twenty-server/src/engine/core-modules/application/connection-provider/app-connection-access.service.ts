import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
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
    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: isWorkspaceShared
          ? getConnectedAccountAdministrationPermissionFlag(
              ConnectedAccountProvider.APP,
            )
          : PermissionFlagType.CONNECTED_ACCOUNTS,
        apiKeyId,
        applicationId,
      });

    if (hasPermission) {
      return;
    }

    if (!isWorkspaceShared) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
      {
        userFriendlyMessage: msg`You do not have permission to manage connections shared with the workspace. Please contact your workspace administrator for access.`,
      },
    );
  }
}
