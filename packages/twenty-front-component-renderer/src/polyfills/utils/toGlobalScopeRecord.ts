// Lib global types lack an index signature, but the worker global scope is a plain mutable object.
export const toGlobalScopeRecord = (
  globalScope: object,
): Record<string, unknown> => globalScope as Record<string, unknown>;
