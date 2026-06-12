import { OUTPUT_DIR } from 'twenty-shared/application';
import { existsSync } from 'fs';
import { join } from 'path';
import { inspect } from 'util';
import { runCliCommand } from '@/cli/__tests__/integration/utils/run-cli-command.util';
import { RICH_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';

inspect.defaultOptions.depth = 10;

describe('Application: install delete and reinstall rich-app', () => {
  const applicationName = 'rich-app';
  const appPath = RICH_APP_PATH;

  beforeAll(async () => {
    expect(existsSync(appPath)).toBe(true);

    const result = await runCliCommand({
      command: 'remote',
      args: ['status'],
      timeout: 5_000,
      waitForOutput: '(valid)',
    });

    expect(result.success).toBe(true);
  });

  it(`should successfully install ${applicationName} application`, async () => {
    await runCliCommand({
      command: 'dev',
      args: [appPath],
      waitForOutput: '✓ Synced',
    });

    expect(existsSync(join(appPath, OUTPUT_DIR, 'manifest.json'))).toBe(true);
  });

  it(`should successfully delete ${applicationName} application`, async () => {
    await runCliCommand({
      command: 'uninstall',
      args: [appPath, '-y'],
      waitForOutput: 'Application uninstalled successfully',
    });
  });

  it(`should successfully re-install ${applicationName} application`, async () => {
    await runCliCommand({
      command: 'dev',
      args: [appPath],
      waitForOutput: '✓ Synced',
    });

    expect(existsSync(join(appPath, OUTPUT_DIR, 'manifest.json'))).toBe(true);
  });
});
