import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isPlainObject } from 'twenty-shared/utils';

import { loadAppSdkDefineExports } from '@/app/pull/load-app-sdk-define-exports';

export const resolvePullSystemPermissionFlag = (
  appPath: string,
): Record<string, unknown> => {
  try {
    const { SystemPermissionFlag: appSystemPermissionFlag } =
      loadAppSdkDefineExports(appPath);

    return isPlainObject(appSystemPermissionFlag)
      ? appSystemPermissionFlag
      : SystemPermissionFlag;
  } catch {
    // assertPullSdkExports surfaces an unloadable SDK once anything is written
    return SystemPermissionFlag;
  }
};
