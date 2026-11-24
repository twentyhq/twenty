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
import { isGraphqlFieldResolverContext } from 'src/engine/guards/utils/is-graphql-field-resolver-context.util';
import { AccessPolicyService } from 'src/engine/guards/access-policy/access-policy.service';
import { PermissionsException } from 'src/engine/permissions/permissions.exception';
import { permissionGraphqlApiExceptionHandler } from 'src/engine/permissions/utils/permission-graphql-api-exception-handler.util';

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

      try {
        await this.accessPolicyService.assertRequestAccessPolicySatisfiedOrThrow(
          { accessPolicy, request },
        );
      } catch (error) {
        // Exception filters do not run on field resolvers
        // TODO: map field resolver errors in one place in a dedicated change, then drop this
        if (
          error instanceof PermissionsException &&
          isGraphqlFieldResolverContext(context)
        ) {
          permissionGraphqlApiExceptionHandler(error);
        }

        throw error;
      }

      return true;
    }
  }

  return mixin(AccessPolicyMixin);
};
