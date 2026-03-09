import { runAppDevInProcess } from '@/cli/__tests__/integration/utils/run-app-dev-in-process.util';
import { join } from 'path';

import { defineEntitiesTests } from './tests/entities.tests';
import { defineManifestTests } from './tests/manifest.tests';

const APP_PATH = join(__dirname, '../..');

describe('rich-app app:dev', () => {
  beforeAll(async () => {
    const result = await runAppDevInProcess({ appPath: APP_PATH });

    if (!result.success) {
      const diagnostics = JSON.stringify(
        { events: result.events, stepStatuses: result.stepStatuses },
        null,
        2,
      );

      throw new Error(
        `app:dev did not produce manifest.json within timeout.\n${diagnostics}`,
      );
    }
  }, 60000);

  defineManifestTests(APP_PATH);
  defineEntitiesTests(APP_PATH);
});
