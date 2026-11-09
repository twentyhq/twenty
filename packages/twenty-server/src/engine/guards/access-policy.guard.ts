import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  mixin,
  SetMetadata,
  type Type,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ACCESS_POLICY_GUARD_CONFIG_KEY } from 'src/engine/guards/constants/access-policy-guard-config-key.constant';
import { AuthPrincipalRefusedException } from 'src/engine/guards/exceptions/auth-principal-refused.exception';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { getRequestOrThrowWhenUnauthenticated } from 'src/engine/guards/utils/get-request-or-throw-when-unauthenticated.util';
import { AccessPolicyService } from 'src/engine/guards/access-policy/access-policy.service';

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

      await this.accessPolicyService.assertRequestAccessPolicySatisfiedOrThrow({
        accessPolicy,
        request,
      });

      return true;
    }
  }

  return mixin(AccessPolicyMixin);
};
