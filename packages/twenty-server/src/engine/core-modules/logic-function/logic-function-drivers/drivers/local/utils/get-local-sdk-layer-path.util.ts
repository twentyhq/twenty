import { join } from 'path';

import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { SDK_CLIENT_GENERATION_KEY } from 'src/engine/core-modules/sdk-client/constants/sdk-client-generation-key';

export const getLocalSdkLayerPath = ({
  workspaceId,
  applicationUniversalIdentifier,
}: {
  workspaceId: string;
  applicationUniversalIdentifier: string;
}): string =>
  join(
    LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER,
    'sdk',
    SDK_CLIENT_GENERATION_KEY,
    `${workspaceId}-${applicationUniversalIdentifier}`,
  );
