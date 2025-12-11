import { existsSync } from 'fs';
import { AppSyncCommand } from '@/cli/commands/app-sync.command';
import { AppUninstallCommand } from '@/cli/commands/app-uninstall.command';
import { COVERED_APPLICATION_FOLDERS } from '@/cli/__tests__/e2e/constants/covered-applications-folder.constant';
import { getTestedApplicationPath } from '@/cli/__tests__/e2e/utils/get-tested-application-path.util';

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
  },
);
