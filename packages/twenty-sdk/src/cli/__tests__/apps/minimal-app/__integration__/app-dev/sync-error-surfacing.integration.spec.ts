import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { mockApiService } from '@/cli/__tests__/integration/utils/setup-app-dev-mocks';
import { AppDevCommand } from '@/cli/commands/dev/dev';

const USER_FRIENDLY_MESSAGE =
  'Your application\'s production dependencies are too large to install. Move packages that are not imported by your logic functions (UI libraries, dev tooling) out of "dependencies".';

describe('minimal-app dev sync error surfacing', () => {
  it('should surface the server userFriendlyMessage when the sync fails', async () => {
    mockApiService.syncApplication.mockResolvedValue({
      success: false,
      error: { userFriendlyMessage: USER_FRIENDLY_MESSAGE },
      message:
        "Dependency layer 'deps-abc' exceeds the Lambda layer size limit: Unzipped size must be smaller than 262144000 bytes",
    });

    const command = new AppDevCommand();

    await command.execute({ appPath: MINIMAL_APP_PATH, headless: true });

    try {
      const deadline = Date.now() + 30_000;
      let syncStepStatus: string | undefined;

      while (Date.now() < deadline) {
        syncStepStatus = command.getOrchestrator()?.getState()?.steps
          .syncApplication.status;

        if (syncStepStatus === 'error') {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      expect(syncStepStatus).toBe('error');

      const eventMessages = (
        command.getOrchestrator()?.getState()?.events ?? []
      )
        .map((event) => event.message)
        .join('\n');

      expect(eventMessages).toContain(USER_FRIENDLY_MESSAGE);
    } finally {
      await command.close();
    }
  }, 60_000);
});
