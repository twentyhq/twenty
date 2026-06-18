import { join, resolve } from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export const UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS = 60;
export const CREDENTIALS_DURATION_IN_SECONDS = 60 * 60; // 1h

export const YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS = 300;
export const YARN_INSTALL_LAMBDA_MEMORY_MB = 1024;
export const BUILDER_LAMBDA_TIMEOUT_SECONDS = 60;
export const BUILDER_LAMBDA_MEMORY_MB = 512;
export const EXECUTOR_LAMBDA_MEMORY_MB = 512;
export const EXECUTOR_LAMBDA_TIMEOUT_SECONDS = 900;
// Headroom added to the SDK abort when the requested timeout reaches the executor
// Lambda's own limit, so the Lambda's timeout fires first and returns a proper
// result instead of the client aborting mid-flight. Covers the request
// round-trip and cold-start init, neither of which counts against the Lambda timeout.
export const EXECUTOR_LAMBDA_INVOKE_ABORT_GRACE_PERIOD_MS = 15_000;
export const LAMBDA_EPHEMERAL_STORAGE_MB = 4096;

export const COMMON_LAYER_NAME_PREFIX = 'twenty-common-layer';
export const YARN_INSTALL_FUNCTION_NAME_PREFIX = 'twenty-yarn-install';
export const BUILDER_FUNCTION_NAME_PREFIX = 'twenty-builder';

export const SDK_LAYER_PREFIX_IN_ZIP = 'nodejs/node_modules/twenty-client-sdk';

export const LAMBDA_PREBUILT_BUNDLE_CHECKSUM_TAG = 'twenty:bundle-checksum';
export const PREBUILT_BUNDLE_FILE_NAME = 'prebuilt-logic-function.mjs';

export const PREBUILT_INSTALL_LOCK_TTL_MS = 180_000;
export const PREBUILT_INSTALL_LOCK_RETRY_MS = 1_000;
export const PREBUILT_INSTALL_LOCK_MAX_RETRIES = 180;

export const YARN_INSTALL_HANDLER_PATH = resolve(
  __dirname,
  join(
    ASSET_PATH,
    'engine/core-modules/logic-function/logic-function-drivers/constants/yarn-install/index.mjs',
  ),
);

export const BUILDER_HANDLER_PATH = resolve(
  __dirname,
  join(
    ASSET_PATH,
    'engine/core-modules/logic-function/logic-function-drivers/constants/builder/index.mjs',
  ),
);
