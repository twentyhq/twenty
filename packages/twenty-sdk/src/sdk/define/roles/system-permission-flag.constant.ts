import { SystemPermissionFlag as SharedSystemPermissionFlag } from 'twenty-shared/constants';

type SdkSystemPermissionFlag = Omit<
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

export const SystemPermissionFlag = Object.assign(
  Object.defineProperties(
    {},
    {
      USER_APPS: { value: SharedSystemPermissionFlag.CONNECTED_ACCOUNTS },
      WORKSPACE_APPS: { value: SharedSystemPermissionFlag.APPLICATIONS },
    },
  ),
  SharedSystemPermissionFlag,
) as SdkSystemPermissionFlag;
