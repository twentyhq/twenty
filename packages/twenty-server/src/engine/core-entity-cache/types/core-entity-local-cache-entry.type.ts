export type CoreEntityVersionEntry<T> = {
  data: T;
  lastReadAt: number;
};

export type CoreEntityLocalCacheEntry<T> = {
  versions: Map<string, CoreEntityVersionEntry<T>>;
  latestHash: string;
  lastHashCheckedAt: number;
};
