import { existsSync } from 'fs';
import { AppSyncCommand } from '@/cli/commands/app-sync.command';
import { AppUninstallCommand } from '@/cli/commands/app-uninstall.command';
import { getTestedApplicationPath } from '@/cli/__tests__/e2e/utils/get-tested-application-path.util';

describe('Application: install delete and reinstall test-app', () => {
  const applicationName = 'test-app';
  const syncCommand = new AppSyncCommand();
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
    const result = await syncCommand.execute(appPath);

    expect(result.success).toBe(true);
  });

  it(`should successfully delete ${applicationName} application`, async () => {
    const result = await deleteCommand.execute({
      appPath,
      askForConfirmation: false,
    });

    expect(result.success).toBe(true);
  });

  it(`should successfully re-install ${applicationName} application`, async () => {
    const result = await syncCommand.execute(appPath);

    expect(result.success).toBe(true);
  });
});
