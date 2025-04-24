import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

import {
  ConfigCacheEntry,
  ConfigKey,
  ConfigValue,
} from './interfaces/config-cache-entry.interface';

@Injectable()
export class ConfigCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(ConfigCacheService.name);
  private readonly foundConfigValuesCache: Map<
    ConfigKey,
    ConfigCacheEntry<ConfigKey>
  >;
  private readonly knownMissingKeysCache: Set<ConfigKey>;

  constructor() {
    this.foundConfigValuesCache = new Map();
    this.knownMissingKeysCache = new Set();
  }

  get<T extends ConfigKey>(key: T): ConfigValue<T> | undefined {
    const entry = this.foundConfigValuesCache.get(key);

    if (!entry) {
      return undefined;
    }

    return entry.value as ConfigValue<T>;
  }

  getOrFallback<T extends ConfigKey, R>(
    key: T,
    fallbackFn: () => R,
  ): ConfigValue<T> | R {
    const value = this.get(key);

    if (value !== undefined) {
      return value;
    }

    return fallbackFn();
  }

  isKeyKnownMissing(key: ConfigKey): boolean {
    return this.knownMissingKeysCache.has(key);
  }

  set<T extends ConfigKey>(key: T, value: ConfigValue<T>): void {
    this.foundConfigValuesCache.set(key, { value });
    this.knownMissingKeysCache.delete(key);
  }

  markKeyAsMissing(key: ConfigKey): void {
    this.knownMissingKeysCache.add(key);
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
    return {
      positiveEntries: this.foundConfigValuesCache.size,
      negativeEntries: this.knownMissingKeysCache.size,
      cacheKeys: Array.from(this.foundConfigValuesCache.keys()),
    };
  }

  onModuleDestroy() {
    this.clearAll();
  }

  getAllKeys(): ConfigKey[] {
    const positiveKeys = Array.from(this.foundConfigValuesCache.keys());
    const negativeKeys = Array.from(this.knownMissingKeysCache);

    return [...new Set([...positiveKeys, ...negativeKeys])];
  }
}
