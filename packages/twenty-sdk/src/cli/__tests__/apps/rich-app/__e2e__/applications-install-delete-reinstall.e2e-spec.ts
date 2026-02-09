import { runAppDev } from '@/cli/__tests__/integration/utils/run-app-dev.util';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { AppUninstallCommand } from '@/cli/commands/app/app-uninstall';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { inspect } from 'util';

inspect.defaultOptions.depth = 10;

describe('Application: install delete and reinstall rich-app', () => {
  const applicationName = 'rich-app';
  const deleteCommand = new AppUninstallCommand();
  const appPath = resolve(__dirname, '../');

  beforeAll(async () => {
    expect(existsSync(appPath)).toBe(true);
  });

  afterAll(async () => {
    const result = await deleteCommand.execute({
      appPath,
      askForConfirmation: false,
    });

    expect(result.success).toBe(true);
  });

  it(`should successfully install ${applicationName} application`, async () => {
    await runAppDev({ appPath });

    expect(existsSync(join(appPath, OUTPUT_DIR, 'manifest.json'))).toBe(true);
  });

  it(`should successfully delete ${applicationName} application`, async () => {
    const result = await deleteCommand.execute({
      appPath,
      askForConfirmation: false,
    });

    expect(result.success).toBe(true);
  });

  it(`should successfully re-install ${applicationName} application`, async () => {
    await runAppDev({ appPath });

    expect(existsSync(join(appPath, OUTPUT_DIR, 'manifest.json'))).toBe(true);
  });
});
