import { runAppDev } from '@/cli/__tests__/integration/utils/run-app-dev.util';
import { type RunCliCommandResult } from '@/cli/__tests__/integration/utils/run-cli-command.util';
import { join } from 'path';

import { defineConsoleOutputTests } from './tests/console-output.tests';
import { defineManifestTests } from '../app-dev/tests/manifest.tests';
import { defineFrontComponentsTests } from '../app-dev/tests/front-components.tests';
import { defineFunctionsTests } from '../app-dev/tests/functions.tests';

const APP_PATH = join(__dirname, '../..');

describe('rich-app app:dev', () => {
  let result: RunCliCommandResult;

  beforeAll(async () => {
    result = await runAppDev({ appPath: APP_PATH });

    expect(result.success).toBe(true);
  }, 60000);

  defineConsoleOutputTests(() => result);
  defineManifestTests(APP_PATH);
  defineFunctionsTests(APP_PATH);
  defineFrontComponentsTests(APP_PATH);
});
