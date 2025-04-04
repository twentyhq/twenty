export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
} 