import { join } from 'path';

import { LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-executor-tmpdir-folder';
import {
  PREBUILT_BUNDLE_FILE_NAME,
  PREBUILT_CHECKSUM_FILE_NAME,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/constants/local-driver.constant';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const getLocalPrebuiltBundleDir = (
  flatLogicFunction: FlatLogicFunction,
): string =>
  join(LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER, 'prebuilt', flatLogicFunction.id);

export const getLocalInstalledBundlePath = (
  flatLogicFunction: FlatLogicFunction,
): string =>
  join(getLocalPrebuiltBundleDir(flatLogicFunction), PREBUILT_BUNDLE_FILE_NAME);

export const getLocalInstalledChecksumPath = (
  flatLogicFunction: FlatLogicFunction,
): string =>
  join(
    getLocalPrebuiltBundleDir(flatLogicFunction),
    PREBUILT_CHECKSUM_FILE_NAME,
  );
