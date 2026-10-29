import { SystemPermissionFlag as SharedSystemPermissionFlag } from 'twenty-shared/constants';

const {
  CONNECTED_ACCOUNTS: USER_APPS,
  APPLICATIONS: WORKSPACE_APPS,
  ...otherSystemPermissionFlags
} = SharedSystemPermissionFlag;

type SystemPermissionFlagWithDeprecatedAliases = Omit<
  typeof SharedSystemPermissionFlag,
  'CONNECTED_ACCOUNTS' | 'APPLICATIONS'
> & {
  readonly USER_APPS: typeof SharedSystemPermissionFlag.CONNECTED_ACCOUNTS;
  readonly WORKSPACE_APPS: typeof SharedSystemPermissionFlag.APPLICATIONS;
  /** @deprecated Use `SystemPermissionFlag.USER_APPS` instead. */
  readonly CONNECTED_ACCOUNTS: typeof SharedSystemPermissionFlag.CONNECTED_ACCOUNTS;
  /** @deprecated Use `SystemPermissionFlag.WORKSPACE_APPS` instead. */
  readonly APPLICATIONS: typeof SharedSystemPermissionFlag.APPLICATIONS;
};

// The server keys stay CONNECTED_ACCOUNTS and APPLICATIONS; only the SDK names change.
// Non-enumerable so Object.keys, Object.values and app pull list each flag once.
export const SystemPermissionFlag = Object.defineProperties(
  { ...otherSystemPermissionFlags, USER_APPS, WORKSPACE_APPS },
  {
    CONNECTED_ACCOUNTS: { value: USER_APPS },
    APPLICATIONS: { value: WORKSPACE_APPS },
  },
) as SystemPermissionFlagWithDeprecatedAliases;
