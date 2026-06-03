import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { getLocalSdkLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-sdk-layer-path.util';

describe('getLocalSdkLayerPath', () => {
  it('joins the tmpdir folder, the sdk segment and "<workspaceId>-<applicationUniversalIdentifier>"', () => {
    expect(
      getLocalSdkLayerPath({
        workspaceId: 'ws-1',
        applicationUniversalIdentifier: 'app-2',
      }),
    ).toBe(`${LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER}/sdk/ws-1-app-2`);
  });
});
