// TTL must exceed the worst-case cold layer build (full yarn install): if the
// lock expires mid-build, waiters acquire it, wipe the half-built layer and
// rebuild concurrently, a stampede that saturates the S3 connection pool.
export const LAYER_BUILD_LOCK_TTL_MS = 900_000;
export const LAYER_BUILD_LOCK_RETRY_MS = 500;
export const LAYER_BUILD_LOCK_MAX_RETRIES = Math.ceil(
  LAYER_BUILD_LOCK_TTL_MS / LAYER_BUILD_LOCK_RETRY_MS,
);

export const LAYER_BUILD_READY_SENTINEL = '.twenty-layer-ready';

export const PREBUILT_BUNDLE_FILE_NAME = 'prebuilt-logic-function.mjs';
export const PREBUILT_CHECKSUM_FILE_NAME = 'prebuilt-bundle.checksum';

export const PREBUILT_INSTALL_LOCK_TTL_MS = 180_000;
export const PREBUILT_INSTALL_LOCK_RETRY_MS = 1_000;
export const PREBUILT_INSTALL_LOCK_MAX_RETRIES = 180;
