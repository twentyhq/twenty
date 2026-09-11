import { createRequire } from 'node:module';
import { join } from 'node:path';

export const isSdkResolvable = (appPath: string): boolean => {
  try {
    createRequire(join(appPath, 'package.json')).resolve('twenty-sdk/define');

    return true;
  } catch {
    return false;
  }
};
