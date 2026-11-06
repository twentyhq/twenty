import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { buildWorkspaceAuthContextFromRequest } from 'src/engine/core-modules/auth/utils/build-workspace-auth-context-from-request.util';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { CORE_PICTURE_UPLOAD_PERMISSION_FLAGS } from 'src/engine/core-modules/file/file-upload/constants/core-picture-upload-permission-flags.constant';
import { buildPermissionFlagDeniedException } from 'src/engine/guards/utils/build-permission-flag-denied-exception.util';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

@Injectable()
export class CreateFileUploadPermissionGuard implements CanActivate {
  constructor(
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;
    const { fileFolder } = gqlContext.getArgs<{ fileFolder: FileFolder }>();

    if (
      fileFolder === FileFolder.AppTarball &&
      isDefined(getScopedCallingApplication(request.application))
    ) {
      throw buildPermissionFlagDeniedException();
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
        : [PermissionFlagType.UPLOAD_FILE];

    for (const permissionFlag of acceptedPermissionFlags) {
      const hasPermission =
        await this.settingPermissionsService.hasPermissionFlag({
          authContext: buildWorkspaceAuthContextFromRequest(request),
          permissionFlag: permissionFlag,
        });

      if (hasPermission) {
        return true;
      }
    }

    throw buildPermissionFlagDeniedException();
  }
}
