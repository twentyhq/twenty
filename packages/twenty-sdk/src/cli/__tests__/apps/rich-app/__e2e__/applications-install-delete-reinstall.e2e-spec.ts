import { getTestedApplicationPath } from '@/cli/__tests__/e2e/utils/get-tested-application-path.util';
import { runAppDev } from '@/cli/__tests__/integration/utils/run-app-dev.util';
import { AppUninstallCommand } from '@/cli/commands/app/app-uninstall';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';
import { existsSync } from 'fs';
import { join } from 'path';
import { inspect } from 'util';

inspect.defaultOptions.depth = 10;

xdescribe('Application: install delete and reinstall rich-app', () => {
  const applicationName = 'rich-app';
  const deleteCommand = new AppUninstallCommand();
  const appPath = getTestedApplicationPath(applicationName);

  // TODO @charles: Re-enable e2e tests after fixing authentication issues
  // beforeAll(async () => {
  //   expect(existsSync(appPath)).toBe(true);
  // });

  // afterAll(async () => {
  //   const result = await deleteCommand.execute({
  //     appPath,
  //     askForConfirmation: false,
  //   });

  //   expect(result.success).toBe(true);
  // });

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
