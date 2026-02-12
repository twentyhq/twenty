import { OUTPUT_DIR } from 'twenty-shared/application';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { inspect } from 'util';
import { runCliCommand } from '@/cli/__tests__/integration/utils/run-cli-command.util';

inspect.defaultOptions.depth = 10;

describe('Application: install delete and reinstall rich-app', () => {
  const applicationName = 'rich-app';
  const appPath = resolve(__dirname, '../');

  beforeAll(async () => {
    expect(existsSync(appPath)).toBe(true);

    const result = await runCliCommand({
      command: 'auth:status',
      args: [appPath],
      timeout: 5_000,
      waitForOutput: '✓ Valid',
    });

    expect(result.success).toBe(true);
  });

  it(`should successfully install ${applicationName} application`, async () => {
    await runCliCommand({
      command: 'app:dev',
      args: [appPath],
      waitForOutput: '✓ Synced',
    });

    expect(existsSync(join(appPath, OUTPUT_DIR, 'manifest.json'))).toBe(true);
  });

  it(`should successfully delete ${applicationName} application`, async () => {
    await runCliCommand({
      command: 'app:uninstall',
      args: [appPath, '-y'],
      waitForOutput: 'Application uninstalled successfully',
    });
  });

  it(`should successfully re-install ${applicationName} application`, async () => {
    await runCliCommand({
      command: 'app:dev',
      args: [appPath],
      waitForOutput: '✓ Synced',
    });

    expect(existsSync(join(appPath, OUTPUT_DIR, 'manifest.json'))).toBe(true);
  });
});
