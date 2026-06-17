import { DisabledDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/disabled.driver';
import { LocalDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local.driver';
import { type LocalDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/types/local-driver.type';
import { type LogicFunctionDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

const params = {
  workspaceId: 'workspace-id',
  applicationUniversalIdentifier: 'app-universal-id',
};

describe('deleteApplicationResources no-op drivers', () => {
  it('DisabledDriver should be a no-op', async () => {
    const driver: LogicFunctionDriver = new DisabledDriver();

    await expect(
      driver.deleteApplicationResources(params),
    ).resolves.toBeUndefined();
  });

  it('LocalDriver should be a no-op (no AWS calls)', async () => {
    const driver: LogicFunctionDriver = new LocalDriver({
      logicFunctionResourceService: {},
      sdkClientArchiveService: {},
      cacheLockService: {},
      workspaceCacheService: {},
    } as unknown as LocalDriverOptions);

    await expect(
      driver.deleteApplicationResources(params),
    ).resolves.toBeUndefined();
  });
});
