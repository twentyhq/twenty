import { join } from 'path';

import { runBuildPipeline } from '@/cli/__tests__/integration/utils/run-build-pipeline.util';
import { defineFrontComponentsTests } from './tests/front-components.tests';
import { defineLogicFunctionsTests } from './tests/logic-functions.tests';
import { defineManifestTests } from './tests/manifest.tests';

const APP_PATH = join(__dirname, '../..');

describe('root-app manifest build', () => {
  beforeAll(async () => {
    const result = await runBuildPipeline(APP_PATH);

    if (!result.success) {
      console.log('Build errors:', result.errors);
    }
    expect(result.success).toBe(true);
  }, 60000);

  defineManifestTests(APP_PATH);
  defineLogicFunctionsTests(APP_PATH);
  defineFrontComponentsTests(APP_PATH);
});
