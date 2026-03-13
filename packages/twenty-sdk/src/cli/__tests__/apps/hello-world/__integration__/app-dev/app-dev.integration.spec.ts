import { runAppDevInProcess } from '@/cli/__tests__/integration/utils/run-app-dev-in-process.util';
import { HELLO_WORLD_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';

import { defineManifestTests } from './tests/manifest.tests';

describe('hello-world app:dev', () => {
  beforeAll(async () => {
    const result = await runAppDevInProcess({ appPath: HELLO_WORLD_APP_PATH });

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

  defineManifestTests(HELLO_WORLD_APP_PATH);
});
