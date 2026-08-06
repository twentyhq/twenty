import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { mockApiService } from '@/cli/__tests__/integration/utils/setup-app-dev-mocks';
import { AppDevCommand } from '@/cli/commands/dev/dev';

const DEPENDENCIES_SIZE_ERROR_CODE = 'LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED';
const DEPENDENCIES_SIZE_ERROR_MESSAGE =
  'Production dependencies are too large to install. Move packages that are not imported by your logic functions (UI libraries, dev tooling) out of "dependencies".';

describe('minimal-app dev sync error surfacing', () => {
  it('should render the dependencies size error through the validation error report when the sync fails', async () => {
    mockApiService.syncApplication.mockResolvedValue({
      success: false,
      error: {
        summary: { totalErrors: 1, logicFunction: 1 },
        errors: {
          logicFunction: [
            {
              type: 'update',
              metadataName: 'logicFunction',
              errors: [
                {
                  code: DEPENDENCIES_SIZE_ERROR_CODE,
                  message: DEPENDENCIES_SIZE_ERROR_MESSAGE,
                  value:
                    "Dependency layer 'deps-abc' exceeds the Lambda layer size limit: Unzipped size must be smaller than 262144000 bytes",
                },
              ],
              flatEntityMinimalInformation: {},
            },
          ],
        },
      },
      message: 'Validation failed for 1 logicFunction',
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

      expect(eventMessages).toContain(DEPENDENCIES_SIZE_ERROR_CODE);
      expect(eventMessages).toContain(DEPENDENCIES_SIZE_ERROR_MESSAGE);
    } finally {
      await command.close();
    }
  }, 60_000);
});
