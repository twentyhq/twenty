export const buildFrontComponentLocalStorageNamespaceRange = (
  namespace: string,
): IDBKeyRange => IDBKeyRange.bound([namespace], [namespace, []]);
