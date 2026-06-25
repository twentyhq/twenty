import { runAppDevInProcess } from '@/cli/__tests__/integration/utils/run-app-dev-in-process.util';
import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';

import { defineFrontComponentsTests } from './tests/front-components.tests';
import { defineLogicFunctionsTests } from './tests/logic-functions.tests';
import { defineManifestTests } from './tests/manifest.tests';

describe('minimal-app dev', () => {
  beforeAll(async () => {
    const result = await runAppDevInProcess({ appPath: MINIMAL_APP_PATH });

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

  defineManifestTests(MINIMAL_APP_PATH);
  defineLogicFunctionsTests(MINIMAL_APP_PATH);
  defineFrontComponentsTests(MINIMAL_APP_PATH);
});
