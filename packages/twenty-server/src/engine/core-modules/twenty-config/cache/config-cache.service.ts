import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

import { CONFIG_VARIABLES_CACHE_TTL } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-ttl';

import {
  ConfigCacheEntry,
  ConfigKey,
  ConfigKnownMissingEntry,
  ConfigValue,
} from './interfaces/config-cache-entry.interface';

@Injectable()
export class ConfigCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(ConfigCacheService.name);
  private readonly foundConfigValuesCache: Map<
    ConfigKey,
    ConfigCacheEntry<ConfigKey>
  >;
  private readonly knownMissingKeysCache: Map<
    ConfigKey,
    ConfigKnownMissingEntry
  >;

  constructor() {
    this.foundConfigValuesCache = new Map();
    this.knownMissingKeysCache = new Map();
  }

  get<T extends ConfigKey>(
    key: T,
  ): { value: ConfigValue<T> | undefined; isStale: boolean } {
    const entry = this.foundConfigValuesCache.get(key);

    if (!entry) {
      return { value: undefined, isStale: false };
    }

    const isStale = this.isCacheExpired(entry);

    return {
      value: entry.value as ConfigValue<T>,
      isStale,
    };
  }

  isKeyKnownMissing(key: ConfigKey): boolean {
    const entry = this.knownMissingKeysCache.get(key);

    if (entry && !this.isCacheExpired(entry)) {
      return true;
    }

    return false;
  }

  set<T extends ConfigKey>(key: T, value: ConfigValue<T>): void {
    this.foundConfigValuesCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: CONFIG_VARIABLES_CACHE_TTL,
    });
    this.knownMissingKeysCache.delete(key);
  }

  markKeyAsMissing(key: ConfigKey): void {
    this.knownMissingKeysCache.set(key, {
      timestamp: Date.now(),
      ttl: CONFIG_VARIABLES_CACHE_TTL,
    });
    this.foundConfigValuesCache.delete(key);
  }

  clear(key: ConfigKey): void {
    this.foundConfigValuesCache.delete(key);
    this.knownMissingKeysCache.delete(key);
  }

  clearAll(): void {
    this.foundConfigValuesCache.clear();
    this.knownMissingKeysCache.clear();
  }

  getCacheInfo(): {
    positiveEntries: number;
    negativeEntries: number;
    cacheKeys: string[];
  } {
    const validPositiveEntries = Array.from(
      this.foundConfigValuesCache.entries(),
    ).filter(([_, entry]) => !this.isCacheExpired(entry));

    const validNegativeEntries = Array.from(
      this.knownMissingKeysCache.entries(),
    ).filter(([_, entry]) => !this.isCacheExpired(entry));

    return {
      positiveEntries: validPositiveEntries.length,
      negativeEntries: validNegativeEntries.length,
      cacheKeys: validPositiveEntries.map(([key]) => key),
    };
  }

  onModuleDestroy() {
    this.clearAll();
  }

  private isCacheExpired(
    entry: ConfigCacheEntry<ConfigKey> | ConfigKnownMissingEntry,
  ): boolean {
    const now = Date.now();

    return now - entry.timestamp > entry.ttl;
  }

  getExpiredKeys(): ConfigKey[] {
    const now = Date.now();
    const expiredPositiveKeys: ConfigKey[] = [];
    const expiredNegativeKeys: ConfigKey[] = [];

    for (const [key, entry] of this.foundConfigValuesCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredPositiveKeys.push(key);
      }
    }

    for (const [key, entry] of this.knownMissingKeysCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredNegativeKeys.push(key);
      }
    }

    return [...new Set([...expiredPositiveKeys, ...expiredNegativeKeys])];
  }
}
