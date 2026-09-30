import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { CORE_PICTURE_UPLOAD_PERMISSION_FLAGS } from 'src/engine/core-modules/file/file-upload/constants/core-picture-upload-permission-flags.constant';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class CreateFileUploadPermissionGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const { fileFolder } = gqlContext.getArgs<{ fileFolder: FileFolder }>();

    if (
      [
        WorkspaceActivationStatus.PENDING_CREATION,
        WorkspaceActivationStatus.ONGOING_CREATION,
      ].includes(request.workspace.activationStatus)
    ) {
      return true;
    }

    const acceptedPermissionFlags = this.getAcceptedPermissionFlags(fileFolder);

    for (const permissionFlag of acceptedPermissionFlags) {
      const hasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId: request.userWorkspaceId,
          workspaceId: request.workspace.id,
          setting: permissionFlag,
          apiKeyId: request.apiKey?.id,
          applicationId: request.application?.id,
        });

      if (hasPermission) {
        return true;
      }
    }

    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
      {
        userFriendlyMessage: msg`You do not have permission to access this feature. Please contact your workspace administrator for access.`,
      },
    );
  }

  // An import file is only ever read by the import, so importing records
  // does not require the general file upload permission.
  private getAcceptedPermissionFlags(
    fileFolder: FileFolder,
  ): readonly PermissionFlagType[] {
    switch (fileFolder) {
      case FileFolder.CorePicture:
        return CORE_PICTURE_UPLOAD_PERMISSION_FLAGS;
      case FileFolder.RecordImport:
        return [PermissionFlagType.IMPORT_CSV];
      default:
        return [PermissionFlagType.UPLOAD_FILE];
    }
  }
}
