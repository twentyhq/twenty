import { type PermissionFlagType } from 'twenty-shared/constants';
import { type FeatureFlagKey } from 'twenty-shared/types';

export type AccessPolicyRefusal =
  | { reason: 'authPrincipal' }
  | { reason: 'featureFlag'; featureFlag: FeatureFlagKey }
  | { reason: 'permissionFlag'; permissionFlag: PermissionFlagType };
