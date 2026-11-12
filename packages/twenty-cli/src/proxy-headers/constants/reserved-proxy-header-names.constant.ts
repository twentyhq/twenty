// The CLI sets these itself; letting a proxy header replace them would break
// Twenty authentication or request framing.
export const RESERVED_PROXY_HEADER_NAMES = new Set([
  'accept',
  'authorization',
  'connection',
  'content-length',
  'content-type',
  'host',
  'transfer-encoding',
]);
