import { type PermissionFlagType } from 'twenty-shared/constants';
import { type FeatureFlagKey } from 'twenty-shared/types';

import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';

export type AccessPolicy = {
  authPrincipals: AuthPrincipalGuardConfig;
  requiredPermissionFlags: PermissionFlagType[];
  requiredFeatureFlags?: FeatureFlagKey[];
  // ACTIVE only, so a workspace still awaiting its subscription (CREATED) is refused too
  isActiveWorkspaceRequired?: boolean;
};
