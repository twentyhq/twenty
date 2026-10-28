import { createRequire } from 'node:module';
import { join } from 'node:path';

export const loadAppSdkDefineExports = (
  appPath: string,
): Record<string, unknown> =>
  createRequire(join(appPath, 'package.json'))('twenty-sdk/define');
