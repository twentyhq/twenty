// Aliased by reference rather than bound: these are namespaces and
// constructors, and a bound constructor is not the same class.
export const NATIVE_VALUE_WINDOW_ALIAS_NAMES = [
  'console',
  'crypto',
  'performance',
  'AbortController',
  'AbortSignal',
  'Blob',
  'File',
  'FormData',
  'Headers',
  'Request',
  'Response',
  'TextDecoder',
  'TextEncoder',
  'URL',
  'URLSearchParams',
] as const;
