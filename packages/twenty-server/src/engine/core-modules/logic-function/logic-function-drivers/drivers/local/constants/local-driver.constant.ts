export const LAYER_BUILD_LOCK_TTL_MS = 120_000;
export const LAYER_BUILD_LOCK_RETRY_MS = 500;
export const LAYER_BUILD_LOCK_MAX_RETRIES = 240;

export const LAYER_BUILD_READY_SENTINEL = '.twenty-layer-ready';

export const PREBUILT_BUNDLE_FILE_NAME = 'prebuilt-logic-function.mjs';
export const PREBUILT_CHECKSUM_FILE_NAME = 'prebuilt-bundle.checksum';

export const PREBUILT_INSTALL_LOCK_TTL_MS = 180_000;
export const PREBUILT_INSTALL_LOCK_RETRY_MS = 1_000;
export const PREBUILT_INSTALL_LOCK_MAX_RETRIES = 180;

export const LOCAL_CHILD_PROCESS_INHERITED_ENV_VARIABLE_NAMES = [
  'PATH',
  'HOME',
  'LANG',
  'LC_ALL',
  'LC_CTYPE',
  'TZ',
  'NODE_ENV',
  'NODE_EXTRA_CA_CERTS',
  'NODE_USE_SYSTEM_CA',
  'NODE_USE_ENV_PROXY',
  'NODE_TLS_REJECT_UNAUTHORIZED',
  'SSL_CERT_FILE',
  'SSL_CERT_DIR',
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'NO_PROXY',
  'http_proxy',
  'https_proxy',
  'no_proxy',
] as const;
