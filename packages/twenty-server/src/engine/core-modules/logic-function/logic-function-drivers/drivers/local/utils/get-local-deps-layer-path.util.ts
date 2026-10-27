import { join } from 'path';
import { computeDependencyFileChecksum } from 'twenty-shared/application';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';

export const getLocalDepsLayerPath = (
  flatApplication: FlatApplication,
): string => {
  const folderName = computeDependencyFileChecksum(
    flatApplication.yarnLockChecksum ??
      flatApplication.packageJsonChecksum ??
      'default',
  );

  return join(LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER, 'deps', folderName);
};
