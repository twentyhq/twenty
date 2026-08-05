import { join } from 'path';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';

export const getLocalDepsLayerPath = (
  flatApplication: FlatApplication,
): string => {
  // A shared fallback like 'default' would make every application without
  // a lockfile resolve to the same layer and receive whichever dependencies
  // were built first.
  const checksum =
    flatApplication.yarnLockChecksum ??
    flatApplication.packageJsonChecksum ??
    flatApplication.id;

  return join(LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER, 'deps', checksum);
};
