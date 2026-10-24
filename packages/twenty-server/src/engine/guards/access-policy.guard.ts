import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  SetMetadata,
  type Type,
} from '@nestjs/common';

import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ACCESS_POLICY_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/access-policy-guard-config-key.constant';
import { AuthPrincipalRefusedException } from 'src/engine/guards/exceptions/auth-principal-refused.exception';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { buildPermissionFlagDeniedException } from 'src/engine/guards/utils/build-permission-flag-denied-exception.util';
import { classifyAuthPrincipal } from 'src/engine/guards/utils/classify-auth-principal.util';
import { findAccessPolicyRefusal } from 'src/engine/guards/utils/find-access-policy-refusal.util';
import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';
import { isSettingsPermissionGranted } from 'src/engine/guards/utils/is-settings-permission-granted.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

export const AccessPolicyGuard = (
  accessPolicy: AccessPolicy,
): Type<CanActivate> => {
  @Injectable()
  @SetMetadata(ACCESS_POLICY_GUARD_CONFIG_KEY, accessPolicy)
  class AccessPolicyMixin implements CanActivate {
    constructor(
      private readonly featureFlagService: FeatureFlagService,
      private readonly permissionsService: PermissionsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = getRequestOrThrowWhenUnauthenticated(context);

      if (!isDefined(request)) {
        throw new AuthPrincipalRefusedException();
      }

      const { workspace } = request;

      const refusal = await findAccessPolicyRefusal({
        accessPolicy,
        authPrincipalVariant: classifyAuthPrincipal(request),
        isFeatureFlagEnabled: (featureFlag) =>
          isDefined(workspace) &&
          this.featureFlagService.isFeatureEnabled(featureFlag, workspace.id),
        isPermissionFlagGranted: (permissionFlag) =>
          isSettingsPermissionGranted({
            permissionsService: this.permissionsService,
            request,
            permissionFlag,
          }),
      });

      if (!isDefined(refusal)) {
        return true;
      }

      switch (refusal.reason) {
        case 'authPrincipal':
          throw new AuthPrincipalRefusedException();
        case 'featureFlag':
          throw new ForbiddenException(
            `Feature flag "${refusal.featureFlag}" is not enabled for this workspace`,
          );
        case 'permissionFlag':
          throw buildPermissionFlagDeniedException();
        default:
          return assertUnreachable(refusal);
      }
    }
  }

  return mixin(AccessPolicyMixin);
};
