import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  mixin,
  SetMetadata,
  type Type,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type PermissionFlagType } from 'twenty-shared/constants';

import { SETTINGS_PERMISSION_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/settings-permission-guard-config-key.constant';
import { buildPermissionFlagDeniedException } from 'src/engine/guards/utils/build-permission-flag-denied-exception.util';
import { AccessPolicyService } from 'src/engine/permissions/access-policy/access-policy.service';

export const SettingsPermissionGuard = (
  requiredPermissions: PermissionFlagType | PermissionFlagType[],
): Type<CanActivate> => {
  const requiredPermissionFlags = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  @Injectable()
  @SetMetadata(SETTINGS_PERMISSION_GUARD_CONFIG_KEY, requiredPermissionFlags)
  class SettingsPermissionMixin implements CanActivate {
    constructor(private readonly accessPolicyService: AccessPolicyService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = GqlExecutionContext.create(context).getContext().req;

      for (const permissionFlag of requiredPermissionFlags) {
        if (
          !(await this.accessPolicyService.isSettingsPermissionGranted({
            request,
            permissionFlag,
          }))
        ) {
          throw buildPermissionFlagDeniedException();
        }
      }

      return true;
    }
  }

  return mixin(SettingsPermissionMixin);
};
