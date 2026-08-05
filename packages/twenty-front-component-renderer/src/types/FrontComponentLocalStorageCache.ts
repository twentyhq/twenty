export type FrontComponentLocalStorageCacheMutation = {
  commit: () => void;
  rollback: () => void;
};

export type FrontComponentLocalStorageCache = {
  getItem: (key: string) => string | null;
  getKeys: () => string[];
  getKeyAtIndex: (index: number) => string | null;
  getLength: () => number;
  getOtherEntriesTotalLength: (excludedKey: string) => number;
  seed: (seededEntries: Record<string, string>) => void;
  beginWrite: (
    key: string,
    serializedValue: string,
  ) => FrontComponentLocalStorageCacheMutation;
  beginDelete: (
    key: string,
  ) => FrontComponentLocalStorageCacheMutation & { wasPresent: boolean };
  beginClear: () => FrontComponentLocalStorageCacheMutation;
};
