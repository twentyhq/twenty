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

const sdkSystemPermissionFlag: SdkSystemPermissionFlag = {
  USER_APPS: SharedSystemPermissionFlag.CONNECTED_ACCOUNTS,
  WORKSPACE_APPS: SharedSystemPermissionFlag.APPLICATIONS,
  ...SharedSystemPermissionFlag,
};

export const SystemPermissionFlag = Object.defineProperties(
  sdkSystemPermissionFlag,
  {
    USER_APPS: { enumerable: false },
    WORKSPACE_APPS: { enumerable: false },
  },
);
