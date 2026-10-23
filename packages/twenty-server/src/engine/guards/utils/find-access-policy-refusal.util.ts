import { type PermissionFlagType } from 'twenty-shared/constants';
import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { type AccessPolicyRefusal } from 'src/engine/guards/types/access-policy-refusal.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { isAuthPrincipalVariantAccepted } from 'src/engine/guards/utils/is-auth-principal-variant-accepted.util';

// Resolves to undefined when the caller satisfies the policy
export const findAccessPolicyRefusal = async ({
  accessPolicy: {
    authPrincipals,
    requiredPermissionFlags,
    requiredFeatureFlags = [],
  },
  authPrincipalVariant,
  isFeatureFlagEnabled,
  isPermissionFlagGranted,
}: {
  accessPolicy: AccessPolicy;
  authPrincipalVariant: AuthPrincipalVariant | undefined;
  isFeatureFlagEnabled: (
    featureFlag: FeatureFlagKey,
  ) => boolean | Promise<boolean>;
  isPermissionFlagGranted: (
    permissionFlag: PermissionFlagType,
  ) => Promise<boolean>;
}): Promise<AccessPolicyRefusal | undefined> => {
  if (
    !isDefined(authPrincipalVariant) ||
    !isAuthPrincipalVariantAccepted({
      authPrincipalGuardConfig: authPrincipals,
      authPrincipalVariant,
    })
  ) {
    return { reason: 'authPrincipal' };
  }

  for (const featureFlag of requiredFeatureFlags) {
    if (!(await isFeatureFlagEnabled(featureFlag))) {
      return { reason: 'featureFlag', featureFlag };
    }
  }

  const grants = await Promise.all(
    requiredPermissionFlags.map((permissionFlag) =>
      isPermissionFlagGranted(permissionFlag),
    ),
  );
  const refusedPermissionFlag = requiredPermissionFlags.find(
    (_, index) => !grants[index],
  );

  return isDefined(refusedPermissionFlag)
    ? { reason: 'permissionFlag', permissionFlag: refusedPermissionFlag }
    : undefined;
};
