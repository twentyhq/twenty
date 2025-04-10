export interface ConfigVarCacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}
