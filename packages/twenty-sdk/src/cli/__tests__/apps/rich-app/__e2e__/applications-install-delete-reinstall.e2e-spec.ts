import { getTestedApplicationPath } from '@/cli/__tests__/e2e/utils/get-tested-application-path.util';
import { AppUninstallCommand } from '@/cli/commands/app/app-uninstall';
import { existsSync } from 'fs';
import { inspect } from 'util';
import { AppDevCommand } from '@/cli/commands/app/app-dev';
import { join } from 'path';

inspect.defaultOptions.depth = 10;

describe('Application: install delete and reinstall rich-app', () => {
  const applicationName = 'rich-app';
  const appDevCommand = new AppDevCommand();
  const deleteCommand = new AppUninstallCommand();
  const appPath = getTestedApplicationPath(applicationName);

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
    await appDevCommand.execute({ appPath });

    expect(existsSync(join(appPath, 'manifest.json'))).toBe(true);
  });

  it(`should successfully delete ${applicationName} application`, async () => {
    const result = await deleteCommand.execute({
      appPath,
      askForConfirmation: false,
    });

    expect(result.success).toBe(true);
  });

  it(`should successfully re-install ${applicationName} application`, async () => {
    await appDevCommand.execute({ appPath });

    expect(existsSync(join(appPath, 'manifest.json'))).toBe(true);
  });
});
