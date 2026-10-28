import { SystemPermissionFlag as SharedSystemPermissionFlag } from 'twenty-shared/constants';

type SystemPermissionFlagWithDeprecatedAliases =
  typeof SharedSystemPermissionFlag & {
    /** @deprecated Use `SystemPermissionFlag.USER_APPS` instead. */
    readonly CONNECTED_ACCOUNTS: typeof SharedSystemPermissionFlag.USER_APPS;
    /** @deprecated Use `SystemPermissionFlag.WORKSPACE_APPS` instead. */
    readonly APPLICATIONS: typeof SharedSystemPermissionFlag.WORKSPACE_APPS;
  };

// Non-enumerable so Object.keys and Object.values list each flag once
export const SystemPermissionFlag = Object.defineProperties(
  { ...SharedSystemPermissionFlag },
  {
    CONNECTED_ACCOUNTS: { value: SharedSystemPermissionFlag.USER_APPS },
    APPLICATIONS: { value: SharedSystemPermissionFlag.WORKSPACE_APPS },
  },
) as SystemPermissionFlagWithDeprecatedAliases;
