import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { CORE_PICTURE_UPLOAD_PERMISSION_FLAGS } from 'src/engine/core-modules/file/file-upload/constants/core-picture-upload-permission-flags.constant';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

const buildPermissionDeniedException = () =>
  new PermissionsException(
    PermissionsExceptionMessage.PERMISSION_DENIED,
    PermissionsExceptionCode.PERMISSION_DENIED,
    {
      userFriendlyMessage: msg`You do not have permission to access this feature. Please contact your workspace administrator for access.`,
    },
  );

@Injectable()
export class CreateFileUploadPermissionGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const { fileFolder } = gqlContext.getArgs<{ fileFolder: FileFolder }>();

    if (
      fileFolder === FileFolder.AppTarball &&
      isDefined(getScopedCallingApplication(request.application))
    ) {
      throw buildPermissionDeniedException();
    }

    if (
      [
        WorkspaceActivationStatus.PENDING_CREATION,
        WorkspaceActivationStatus.ONGOING_CREATION,
      ].includes(request.workspace.activationStatus)
    ) {
      return true;
    }

    const acceptedPermissionFlags =
      fileFolder === FileFolder.CorePicture
        ? CORE_PICTURE_UPLOAD_PERMISSION_FLAGS
        : fileFolder === FileFolder.ApplicationRegistrationVariableUpload
          ? [PermissionFlagType.API_KEYS_AND_WEBHOOKS]
          : [PermissionFlagType.UPLOAD_FILE];

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

    throw buildPermissionDeniedException();
  }
}
