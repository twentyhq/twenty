import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { LEGACY_SYSTEM_PERMISSION_FLAG } from '@/app/pull/legacy-system-permission-flag.constant';
import { loadAppSdkDefineExports } from '@/app/pull/load-app-sdk-define-exports';

export const resolvePullSystemPermissionFlag = (
  appPath: string,
): Record<string, string> => {
  const { SystemPermissionFlag: appSystemPermissionFlag } =
    loadAppSdkDefineExports(appPath);

  return isPlainObject(appSystemPermissionFlag) &&
    isDefined(appSystemPermissionFlag.USER_APPS) &&
    isDefined(appSystemPermissionFlag.WORKSPACE_APPS)
    ? SystemPermissionFlag
    : LEGACY_SYSTEM_PERMISSION_FLAG;
};
