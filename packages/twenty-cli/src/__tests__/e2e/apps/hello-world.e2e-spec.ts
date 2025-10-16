import { AppSyncCommand } from '../../../commands/app-sync.command';
import { COVERED_APPLICATION_FOLDERS } from '../constants/covered-applications-folder.constant';
describe('Application sync e2e test suite', () => {
  const syncCommand = new AppSyncCommand();
  it('Should synchronize hello-world', async () => {
    const tmp = await syncCommand.execute(
      COVERED_APPLICATION_FOLDERS['hello-world'].path,
    );
  });
});
