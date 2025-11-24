import { existsSync } from 'fs';
import { AppSyncCommand } from '../../commands/app-sync.command';
import { AppUninstallCommand } from '../../commands/app-uninstall.command';
import { COVERED_APPLICATION_FOLDERS } from './constants/covered-applications-folder.constant';
import { getTestedApplicationPath } from './utils/get-tested-application-path.util';

describe.each(COVERED_APPLICATION_FOLDERS)(
  'Application: "%s" install delete and reinstall test suite',
  (applicationName) => {
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

    it.only(`should successfully install ${applicationName} application`, async () => {
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
  },
);
