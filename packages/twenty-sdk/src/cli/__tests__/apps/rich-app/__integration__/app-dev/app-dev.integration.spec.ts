import { runAppDev } from '@/cli/__tests__/integration/utils/run-app-dev.util';
import { type RunCliCommandResult } from '@/cli/__tests__/integration/utils/run-cli-command.util';
import { join } from 'path';

import { defineConsoleOutputTests } from './tests/console-output.tests';
import { defineManifestTests } from './tests/manifest.tests';
import { defineEntitiesTests } from './tests/entities.tests';

const APP_PATH = join(__dirname, '../..');

describe('rich-app app:dev', () => {
  let result: RunCliCommandResult;

  beforeAll(async () => {
    result = await runAppDev({ appPath: APP_PATH });
    expect(result.success).toBe(true);
  }, 60000);

  defineConsoleOutputTests(() => result);
  defineManifestTests(APP_PATH);
  defineEntitiesTests(APP_PATH);
});
