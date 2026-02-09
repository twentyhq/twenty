import { join } from 'path';

import { runAppDev } from '@/cli/__tests__/integration/utils/run-app-dev.util';
import { type RunCliCommandResult } from '@/cli/__tests__/integration/utils/run-cli-command.util';
import { defineConsoleOutputTests } from './tests/console-output.tests';
import { defineFrontComponentsTests } from './tests/front-components.tests';
import { defineLogicFunctionsTests } from './tests/logic-functions.tests';
import { defineManifestTests } from './tests/manifest.tests';

const APP_PATH = join(__dirname, '../..');

describe('root-app app:dev', () => {
  let result: RunCliCommandResult;

  beforeAll(async () => {
    result = await runAppDev({ appPath: APP_PATH });
    if (!result.success) {
      console.log(result.output.slice(undefined, 20_000));
    }
    expect(result.success).toBe(true);
  }, 60000);

  defineConsoleOutputTests(() => result);
  defineManifestTests(APP_PATH);
  defineLogicFunctionsTests(APP_PATH);
  defineFrontComponentsTests(APP_PATH);
});
