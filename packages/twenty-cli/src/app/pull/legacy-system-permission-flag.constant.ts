import { SystemPermissionFlag } from 'twenty-shared/constants';

const { USER_APPS, WORKSPACE_APPS, ...unrenamedSystemPermissionFlag } =
  SystemPermissionFlag;

// The names twenty-sdk exported before USER_APPS and WORKSPACE_APPS.
export const LEGACY_SYSTEM_PERMISSION_FLAG: Record<string, string> = {
  ...unrenamedSystemPermissionFlag,
  CONNECTED_ACCOUNTS: USER_APPS,
  APPLICATIONS: WORKSPACE_APPS,
};
