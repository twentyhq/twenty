import { OUTPUT_DIR } from 'twenty-shared/application';
import { AppUninstallCommand } from '@/cli/commands/app/app-uninstall';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { inspect } from 'util';
import { runCliCommand } from '@/cli/__tests__/integration/utils/run-cli-command.util';

inspect.defaultOptions.depth = 10;

describe('Application: install delete and reinstall rich-app', () => {
  const applicationName = 'rich-app';
  const uninstallCommand = new AppUninstallCommand();
  const appPath = resolve(__dirname, '../');

  beforeAll(async () => {
    expect(existsSync(appPath)).toBe(true);
  });

  afterAll(async () => {
    const result = await uninstallCommand.execute({
      appPath,
      askForConfirmation: false,
    });

    expect(result.success).toBe(true);
  });

  it(`should successfully install ${applicationName} application`, async () => {
    await runCliCommand({
      command: 'app:dev',
      args: [appPath],
      waitForOutput: ['✓ Synced'],
    });

    expect(existsSync(join(appPath, OUTPUT_DIR, 'manifest.json'))).toBe(true);
  });

  it(`should successfully delete ${applicationName} application`, async () => {
    await runCliCommand({
      command: 'app:uninstall',
      args: [appPath, '-y'],
      waitForOutput: ['Application uninstalled successfully'],
    });
  });

  it(`should successfully re-install ${applicationName} application`, async () => {
    await runCliCommand({
      command: 'app:dev',
      args: [appPath],
      waitForOutput: ['✓ Synced'],
    });

    expect(existsSync(join(appPath, OUTPUT_DIR, 'manifest.json'))).toBe(true);
  });
});
