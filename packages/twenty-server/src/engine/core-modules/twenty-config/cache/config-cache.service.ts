import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

import { CONFIG_VARIABLES_CACHE_MAX_ENTRIES } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-max-entries';
import { CONFIG_VARIABLES_CACHE_SCAVENGE_INTERVAL } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-scavenge-interval';
import { CONFIG_VARIABLES_CACHE_TTL } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-ttl';

import {
  ConfigCacheEntry,
  ConfigKey,
  ConfigNegativeCacheEntry,
  ConfigValue,
} from './interfaces/config-cache-entry.interface';

@Injectable()
export class ConfigCacheService implements OnModuleDestroy {
  private readonly valueCache: Map<ConfigKey, ConfigCacheEntry<ConfigKey>>;
  private readonly negativeLookupCache: Map<
    ConfigKey,
    ConfigNegativeCacheEntry
  >;
  private cacheScavengeInterval: NodeJS.Timeout;
  private readonly logger = new Logger(ConfigCacheService.name);

  constructor() {
    this.valueCache = new Map();
    this.negativeLookupCache = new Map();
    this.startCacheScavenging();
  }

  get<T extends ConfigKey>(key: T): ConfigValue<T> | undefined {
    const entry = this.valueCache.get(key);

    if (entry && !this.isCacheExpired(entry)) {
      this.logger.debug(`🟢 [Cache:${key}] Positive cache hit`);

      return entry.value as ConfigValue<T>;
    }

    return undefined;
  }

  getNegativeLookup(key: ConfigKey): boolean {
    const entry = this.negativeLookupCache.get(key);

    if (entry && !this.isCacheExpired(entry)) {
      this.logger.debug(`🔴 [Cache:${key}] Negative cache hit`);

      return true;
    }

    return false;
  }

  set<T extends ConfigKey>(key: T, value: ConfigValue<T>): void {
    this.valueCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: CONFIG_VARIABLES_CACHE_TTL,
    });
    this.negativeLookupCache.delete(key);
    this.logger.debug(`✅ [Cache:${key}] Updated positive cache`);
  }

  setNegativeLookup(key: ConfigKey): void {
    this.negativeLookupCache.set(key, {
      value: true,
      timestamp: Date.now(),
      ttl: CONFIG_VARIABLES_CACHE_TTL,
    });
    this.valueCache.delete(key);
    this.logger.debug(`❌ [Cache:${key}] Updated negative cache`);
  }

  clear(key: ConfigKey): void {
    this.valueCache.delete(key);
    this.negativeLookupCache.delete(key);
    this.logger.debug(`🧹 [Cache:${key}] Cleared cache entries`);
  }

  clearAll(): void {
    this.valueCache.clear();
    this.negativeLookupCache.clear();
    this.logger.debug('🧹 Cleared all cache entries');
  }

  getCacheInfo(): {
    positiveEntries: number;
    negativeEntries: number;
    cacheKeys: string[];
  } {
    const validPositiveEntries = Array.from(this.valueCache.entries()).filter(
      ([_, entry]) => !this.isCacheExpired(entry),
    );

    const validNegativeEntries = Array.from(
      this.negativeLookupCache.entries(),
    ).filter(([_, entry]) => !this.isCacheExpired(entry));

    return {
      positiveEntries: validPositiveEntries.length,
      negativeEntries: validNegativeEntries.length,
      cacheKeys: validPositiveEntries.map(([key]) => key),
    };
  }

  onModuleDestroy() {
    if (this.cacheScavengeInterval) {
      clearInterval(this.cacheScavengeInterval);
    }
  }

  private isCacheExpired(
    entry: ConfigCacheEntry<ConfigKey> | ConfigNegativeCacheEntry,
  ): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private startCacheScavenging(): void {
    this.cacheScavengeInterval = setInterval(() => {
      this.scavengeCache();
    }, CONFIG_VARIABLES_CACHE_SCAVENGE_INTERVAL);
  }

  private scavengeCache(): void {
    const now = Date.now();
    let expiredCount = 0;
    let sizeLimitedCount = 0;

    for (const [key, entry] of this.valueCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.valueCache.delete(key);
        expiredCount++;
      }
    }

    for (const [key, entry] of this.negativeLookupCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.negativeLookupCache.delete(key);
        expiredCount++;
      }
    }

    if (this.valueCache.size > CONFIG_VARIABLES_CACHE_MAX_ENTRIES) {
      const entriesToDelete =
        this.valueCache.size - CONFIG_VARIABLES_CACHE_MAX_ENTRIES;
      const keysToDelete = Array.from(this.valueCache.keys()).slice(
        0,
        entriesToDelete,
      );

      keysToDelete.forEach((key) => this.valueCache.delete(key));
      sizeLimitedCount += entriesToDelete;
    }

    if (this.negativeLookupCache.size > CONFIG_VARIABLES_CACHE_MAX_ENTRIES) {
      const entriesToDelete =
        this.negativeLookupCache.size - CONFIG_VARIABLES_CACHE_MAX_ENTRIES;
      const keysToDelete = Array.from(this.negativeLookupCache.keys()).slice(
        0,
        entriesToDelete,
      );

      keysToDelete.forEach((key) => this.negativeLookupCache.delete(key));
      sizeLimitedCount += entriesToDelete;
    }

    if (expiredCount > 0 || sizeLimitedCount > 0) {
      this.logger.debug(
        `🧹 Cache scavenging completed: ${expiredCount} expired entries removed, ${sizeLimitedCount} entries removed due to size limits`,
      );
    }
  }
}
