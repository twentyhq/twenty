import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

@Injectable()
export class AppConnectionAccessService {
  constructor(
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  async validateCallerCanManageConnection({
    isWorkspaceShared,
    workspaceId,
    userWorkspaceId,
  }: {
    isWorkspaceShared: boolean;
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<void> {
    const hasPermission =
      await this.settingPermissionsService.userWorkspaceHasPermissionFlag({
        workspaceId,
        userWorkspaceId,
        permissionFlag: isWorkspaceShared
          ? PermissionFlagType.APPLICATIONS
          : PermissionFlagType.CONNECTED_ACCOUNTS,
      });

    if (hasPermission) {
      return;
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
      {
        userFriendlyMessage: isWorkspaceShared
          ? msg`You do not have permission to manage connections shared with the workspace. Please contact your workspace administrator for access.`
          : msg`You do not have permission to connect accounts. Please contact your workspace administrator for access.`,
      },
    );
  }
}
