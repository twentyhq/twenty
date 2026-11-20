import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { getLocalSdkLayerPath } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-sdk-layer-path.util';
import { SDK_CLIENT_GENERATION_KEY } from 'src/engine/core-modules/sdk-client/constants/sdk-client-generation-key';

describe('getLocalSdkLayerPath', () => {
  it('joins the tmpdir folder, the sdk segment, the generation key and "<workspaceId>-<applicationUniversalIdentifier>"', () => {
    expect(
      getLocalSdkLayerPath({
        workspaceId: 'ws-1',
        applicationUniversalIdentifier: 'app-2',
      }),
    ).toBe(
      `${LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER}/sdk/${SDK_CLIENT_GENERATION_KEY}/ws-1-app-2`,
    );
  });
});
