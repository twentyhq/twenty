import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';
import { isAuthPrincipalVariantAccepted } from 'src/engine/guards/utils/is-auth-principal-variant-accepted.util';

export const isAccessPolicySatisfied = async ({
  accessPolicy: {
    authPrincipals,
    requiredPermissionFlags,
    requiredFeatureFlags = [],
  },
  authPrincipalVariant,
  featureFlagsMap,
  isPermissionFlagGranted,
}: {
  accessPolicy: AccessPolicy;
  authPrincipalVariant: AuthPrincipalVariant | undefined;
  featureFlagsMap: FeatureFlagMap;
  isPermissionFlagGranted: (
    permissionFlag: PermissionFlagType,
  ) => Promise<boolean>;
}): Promise<boolean> => {
  if (
    !isDefined(authPrincipalVariant) ||
    !isAuthPrincipalVariantAccepted({
      authPrincipalGuardConfig: authPrincipals,
      authPrincipalVariant,
    })
  ) {
    return false;
  }

  if (
    !requiredFeatureFlags.every(
      (featureFlag) => featureFlagsMap[featureFlag] === true,
    )
  ) {
    return false;
  }

  const grants = await Promise.all(
    requiredPermissionFlags.map((permissionFlag) =>
      isPermissionFlagGranted(permissionFlag),
    ),
  );

  return grants.every((isGranted) => isGranted);
};
