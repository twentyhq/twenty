import { createRequire } from 'node:module';
import { join } from 'node:path';

import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export const resolveAppSystemPermissionFlag = (
  appPath: string,
): Record<string, string> => {
  const { SystemPermissionFlag: appSystemPermissionFlag } = createRequire(
    join(appPath, 'package.json'),
  )('twenty-sdk/define');

  return isPlainObject(appSystemPermissionFlag)
    ? Object.fromEntries(
        Object.getOwnPropertyNames(appSystemPermissionFlag)
          .map((name) => [name, appSystemPermissionFlag[name]])
          .filter((entry): entry is [string, string] => isString(entry[1])),
      )
    : {};
};
