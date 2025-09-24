import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isDefined } from 'class-validator';

import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class ImpersonatePermissionGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const userWorkspaceId = request.userWorkspaceId;
    const workspaceId = request.workspace.id;

    if (!isDefined(userWorkspaceId)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: "Can't impersonate user via api key",
        },
      );
    }

    if (request.user.canImpersonate === true) return true;

    const hasPermission =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        setting: PermissionFlagType.IMPERSONATE,
        workspaceId,
      });

    if (hasPermission === true) return true;

    throw new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
      {
        userFriendlyMessage:
          'You do not have permission to impersonate users. Please contact your workspace administrator for access.',
      },
    );
  }
}
