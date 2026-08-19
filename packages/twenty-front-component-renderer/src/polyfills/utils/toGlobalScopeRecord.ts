// Lib global types carry no index signature, but at runtime the worker
// global scope is an ordinary mutable object the polyfills install onto.
// The one assertion lives here so call sites stay cast-free.
export const toGlobalScopeRecord = (
  globalScope: object,
): Record<string, unknown> => globalScope as Record<string, unknown>;
