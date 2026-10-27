import { join } from 'path';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import { logicFunctionCreateHash } from 'src/engine/metadata-modules/logic-function/utils/logic-function-create-hash.utils';

export const getLocalDepsLayerPath = (
  flatApplication: FlatApplication,
): string => {
  const folderName = logicFunctionCreateHash(
    flatApplication.yarnLockChecksum ??
      flatApplication.packageJsonChecksum ??
      'default',
  );

  return join(LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER, 'deps', folderName);
};
