// Set by the CLI; replacing them would break Twenty auth or request framing.
export const RESERVED_PROXY_HEADER_NAMES = new Set([
  'accept',
  'authorization',
  'connection',
  'content-length',
  'content-type',
  'host',
  'transfer-encoding',
]);
