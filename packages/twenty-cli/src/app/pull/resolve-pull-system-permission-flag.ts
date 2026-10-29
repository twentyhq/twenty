import { createRequire } from 'node:module';
import { join } from 'node:path';

import { isString } from '@sniptt/guards';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isPlainObject } from 'twenty-shared/utils';

export const resolvePullSystemPermissionFlag = (
  appPath: string,
): Record<string, string> => {
  try {
    const { SystemPermissionFlag: appSystemPermissionFlag } = createRequire(
      join(appPath, 'package.json'),
    )('twenty-sdk/define');

    return isPlainObject(appSystemPermissionFlag)
      ? Object.fromEntries(
          Object.entries(appSystemPermissionFlag).filter(
            (entry): entry is [string, string] => isString(entry[1]),
          ),
        )
      : SystemPermissionFlag;
  } catch {
    return SystemPermissionFlag;
  }
};
