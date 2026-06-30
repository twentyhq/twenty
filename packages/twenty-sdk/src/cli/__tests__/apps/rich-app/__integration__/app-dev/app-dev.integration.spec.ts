import { runAppDevInProcess } from '@/cli/__tests__/integration/utils/run-app-dev-in-process.util';
import { RICH_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';

import { defineEntitiesTests } from './tests/entities.tests';
import { defineFieldOptionIdsTests } from './tests/field-option-ids.tests';
import { defineManifestTests } from './tests/manifest.tests';

describe('rich-app dev', () => {
  beforeAll(async () => {
    const result = await runAppDevInProcess({ appPath: RICH_APP_PATH });

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

  defineManifestTests(RICH_APP_PATH);
  defineEntitiesTests(RICH_APP_PATH);
  defineFieldOptionIdsTests(RICH_APP_PATH);
});
