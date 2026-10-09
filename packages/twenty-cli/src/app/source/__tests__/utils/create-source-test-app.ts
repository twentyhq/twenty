import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const SOURCE_TEST_APPLICATION_ID =
  'e1e2e3e4-e5e6-4000-8000-000000000001';

export const createSourceTestApp = async (appPath: string) => {
  const sdkPath = join(appPath, 'node_modules', 'twenty-sdk');

  await mkdir(sdkPath, { recursive: true });
  await writeFile(
    join(appPath, 'package.json'),
    JSON.stringify({
      name: 'source-test-app',
      dependencies: { 'twenty-sdk': '2.44.0' },
    }),
  );
  await writeFile(
    join(sdkPath, 'package.json'),
    JSON.stringify({
      name: 'twenty-sdk',
      version: '2.44.0',
      exports: {
        './define': './define.cjs',
        './front-component': './front-component.cjs',
      },
    }),
  );
  await writeFile(
    join(sdkPath, 'define.cjs'),
    `
    const define = (config) => ({ success: true, config, errors: [] });
    exports.defineApplication = define;
    exports.defineObject = define;
    exports.defineLogicFunction = define;
    exports.defineFrontComponent = define;
    exports.defineCommandMenuItem = define;
  `,
  );
  await writeFile(
    join(sdkPath, 'front-component.cjs'),
    'exports.useRecord = () => undefined;',
  );

  return sdkPath;
};

export const sourceApplication = (extraSource = '') => `
  import { defineApplication } from 'twenty-sdk/define';
  ${extraSource}
  export default defineApplication({
    universalIdentifier: '${SOURCE_TEST_APPLICATION_ID}',
    displayName: 'Source app',
  });
`;
