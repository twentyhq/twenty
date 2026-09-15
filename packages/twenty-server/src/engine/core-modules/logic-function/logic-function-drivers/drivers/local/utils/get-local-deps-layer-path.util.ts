import { join } from 'path';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { getDepsLayerChecksum } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/get-deps-layer-checksum.util';

export const getLocalDepsLayerPath = (
  flatApplication: FlatApplication,
): string => {
  const checksum = getDepsLayerChecksum(flatApplication);

  return join(LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER, 'deps', checksum);
};
