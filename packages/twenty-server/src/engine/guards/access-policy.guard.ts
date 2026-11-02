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

import { ACCESS_POLICY_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/access-policy-guard-config-key.constant';
import { AuthPrincipalRefusedException } from 'src/engine/guards/exceptions/auth-principal-refused.exception';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { buildPermissionFlagDeniedException } from 'src/engine/guards/utils/build-permission-flag-denied-exception.util';
import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';
import { AccessPolicyService } from 'src/engine/permissions/access-policy/access-policy.service';

export const AccessPolicyGuard = (
  accessPolicy: AccessPolicy,
): Type<CanActivate> => {
  @Injectable()
  @SetMetadata(ACCESS_POLICY_GUARD_CONFIG_KEY, accessPolicy)
  class AccessPolicyMixin implements CanActivate {
    constructor(private readonly accessPolicyService: AccessPolicyService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = getRequestOrThrowWhenUnauthenticated(context);

      if (!isDefined(request)) {
        throw new AuthPrincipalRefusedException();
      }

      const refusal = await this.accessPolicyService.findRequestRefusal({
        accessPolicy,
        request,
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
