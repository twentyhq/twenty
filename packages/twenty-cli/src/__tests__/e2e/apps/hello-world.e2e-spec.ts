import { AppDeleteCommand } from '../../../commands/app-delete.command';
import { AppSyncCommand } from '../../../commands/app-sync.command';
import { COVERED_APPLICATION_FOLDERS } from '../constants/covered-applications-folder.constant';
// TODO 1 Make dynamic or codegen based on known covered app
// TODO 2 path aliasing typescript
describe('Application sync e2e test suite', () => {
  const syncCommand = new AppSyncCommand();
  const deleteCommand = new AppDeleteCommand();
  it('should successfully synchronize hello-world app', async () => {
    const result = await syncCommand.execute(
      COVERED_APPLICATION_FOLDERS['hello-world'].path,
    );

    expect(result).toMatchInlineSnapshot();
  });

  it('should successfully delete hello-world app', async () => {
    const result = await deleteCommand.execute(
      COVERED_APPLICATION_FOLDERS['hello-world'].path,
    );

    expect(result).toMatchInlineSnapshot();
  });
});
