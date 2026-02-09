import { runBuildPipeline } from '@/cli/__tests__/integration/utils/run-build-pipeline.util';
import { join } from 'path';

import { defineEntitiesTests } from './tests/entities.tests';
import { defineManifestTests } from './tests/manifest.tests';

const APP_PATH = join(__dirname, '../..');

describe('rich-app manifest build', () => {
  beforeAll(async () => {
    const result = await runBuildPipeline(APP_PATH);

    if (!result.success) {
      console.log('Build errors:', result.errors);
    }
    expect(result.success).toBe(true);
  }, 60000);

  defineManifestTests(APP_PATH);
  defineEntitiesTests(APP_PATH);
});
