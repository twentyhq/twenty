import { createRequire } from 'node:module';
import { join } from 'node:path';

import { isString } from '@sniptt/guards';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isPlainObject } from 'twenty-shared/utils';

// Names flags as the app's installed SDK does: USER_APPS and WORKSPACE_APPS from twenty-sdk 2.54
export const resolvePullSystemPermissionFlag = (
  appPath: string,
): Record<string, string> => {
  try {
    const { SystemPermissionFlag: appSystemPermissionFlag } = createRequire(
      join(appPath, 'package.json'),
    )('twenty-sdk/define');

    if (isPlainObject(appSystemPermissionFlag)) {
      return Object.fromEntries(
        Object.entries(appSystemPermissionFlag).filter(
          (entry): entry is [string, string] => isString(entry[1]),
        ),
      );
    }
  } catch {
    // assertPullSdkExports reports an SDK that cannot be loaded
  }

  return SystemPermissionFlag;
};
