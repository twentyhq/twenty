import { runAppDevInProcess } from '@/cli/__tests__/integration/utils/run-app-dev-in-process.util';
import { POSTCARD_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';

import { defineEntitiesTests } from './tests/entities.tests';
import { defineManifestTests } from './tests/manifest.tests';

describe('postcard-app dev', () => {
  beforeAll(async () => {
    const result = await runAppDevInProcess({ appPath: POSTCARD_APP_PATH });

    if (!result.success) {
      const diagnostics = JSON.stringify(
        { events: result.events, stepStatuses: result.stepStatuses },
        null,
        2,
      );

      throw new Error(
        `dev did not produce manifest.json within timeout.\n${diagnostics}`,
      );
    }
  }, 60000);

  defineManifestTests(POSTCARD_APP_PATH);
  defineEntitiesTests(POSTCARD_APP_PATH);
});
