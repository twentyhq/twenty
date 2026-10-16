import { type PermissionFlagType } from 'twenty-shared/constants';

import { type AuthPrincipalGuardConfig } from 'src/engine/guards/types/auth-principal-guard-config.type';

export type OperationPolicy = {
  name: string;
  authPrincipal: AuthPrincipalGuardConfig;
  permissionFlags: readonly PermissionFlagType[];
};
