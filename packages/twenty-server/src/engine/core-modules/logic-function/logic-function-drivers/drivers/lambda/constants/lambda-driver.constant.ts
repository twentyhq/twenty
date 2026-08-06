import { join, resolve } from 'path';

import { ASSET_PATH } from 'src/constants/assets-path';

export const UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS = 60;
export const CREDENTIALS_DURATION_IN_SECONDS = 60 * 60; // 1h

export const LAMBDA_CLIENT_MAX_ATTEMPTS = 8;
export const LAMBDA_CLIENT_RETRY_MODE = 'adaptive' as const;

export const YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS = 300;
export const YARN_INSTALL_LAMBDA_MEMORY_MB = 1024;
export const BUILDER_LAMBDA_TIMEOUT_SECONDS = 60;
export const BUILDER_LAMBDA_MEMORY_MB = 512;
export const EXECUTOR_LAMBDA_MEMORY_MB = 512;
export const EXECUTOR_LAMBDA_TIMEOUT_SECONDS = 900;
export const LAMBDA_EPHEMERAL_STORAGE_MB = 4096;

/**
 * Synchronous invocations block a socket for as long as the function runs, so
 * this ceiling has to clear the longest executor timeout with room to spare.
 * It exists to bound a hung request, not to cut short a legitimate one.
 */
export const LAMBDA_CLIENT_REQUEST_TIMEOUT_MS =
  (EXECUTOR_LAMBDA_TIMEOUT_SECONDS + 60) * 1000;
/**
 * Above the SDK default of 50: long-running invocations legitimately occupy
 * sockets for minutes, and they must not starve the control-plane calls
 * (layer lookups, waiters) that share this client. Each socket is one TCP
 * connection to the Lambda endpoint, so this trades file descriptors for
 * concurrency and can be raised further if builds start queueing.
 */
export const LAMBDA_CLIENT_MAX_SOCKETS = 500;
/**
 * Generous because it also caps how long a call may wait for a free socket:
 * concurrent builds and invocations can burst well above the pool size, and
 * they should queue rather than fail while the pool drains.
 */
export const LAMBDA_CLIENT_CONNECTION_TIMEOUT_MS = 60_000;

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
