import { SystemPermissionFlag as SharedSystemPermissionFlag } from 'twenty-shared/constants';

export const SystemPermissionFlag = {
  ...SharedSystemPermissionFlag,
  /** @deprecated Use `SystemPermissionFlag.USER_APPS` instead. */
  CONNECTED_ACCOUNTS: SharedSystemPermissionFlag.USER_APPS,
  /** @deprecated Use `SystemPermissionFlag.WORKSPACE_APPS` instead. */
  APPLICATIONS: SharedSystemPermissionFlag.WORKSPACE_APPS,
} as const;
