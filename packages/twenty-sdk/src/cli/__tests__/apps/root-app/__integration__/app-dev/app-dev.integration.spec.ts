import { join } from 'path';

import { runAppDevInProcess } from '@/cli/__tests__/integration/utils/run-app-dev-in-process.util';
import { defineFrontComponentsTests } from './tests/front-components.tests';
import { defineLogicFunctionsTests } from './tests/logic-functions.tests';
import { defineManifestTests } from './tests/manifest.tests';

const APP_PATH = join(__dirname, '../..');

describe('root-app app:dev', () => {
  beforeAll(async () => {
    const result = await runAppDevInProcess({ appPath: APP_PATH });

    expect(result.success).toBe(true);
  }, 60000);

  defineManifestTests(APP_PATH);
  defineLogicFunctionsTests(APP_PATH);
  defineFrontComponentsTests(APP_PATH);
});
