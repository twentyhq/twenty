import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const writeTestSourceSdk = async ({
  appPath,
  version = '9.9.9',
  requiredNode = '^24.5.0',
  hasSourceExports = true,
}: {
  appPath: string;
  version?: string;
  requiredNode?: string;
  hasSourceExports?: boolean;
}) => {
  const sdkPath = join(appPath, 'node_modules', 'twenty-sdk');

  await mkdir(sdkPath, { recursive: true });
  await writeFile(
    join(sdkPath, 'package.json'),
    JSON.stringify({
      name: 'twenty-sdk',
      version,
      engines: { node: requiredNode },
      exports: hasSourceExports
        ? { './define': './index.cjs', './front-component': './index.cjs' }
        : {},
    }),
  );
  await writeFile(join(sdkPath, 'index.cjs'), 'module.exports = {};');

  return sdkPath;
};
