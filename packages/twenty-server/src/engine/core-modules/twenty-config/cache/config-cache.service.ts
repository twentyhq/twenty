import { Injectable, type OnModuleDestroy } from '@nestjs/common';

import {
  type ConfigCacheEntry,
  type ConfigKey,
  type ConfigValue,
} from './interfaces/config-cache-entry.interface';

@Injectable()
export class ConfigCacheService implements OnModuleDestroy {
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
    foundConfigValues: number;
    knownMissingKeys: number;
    cacheKeys: string[];
  } {
    return {
      foundConfigValues: this.foundConfigValuesCache.size,
      knownMissingKeys: this.knownMissingKeysCache.size,
      cacheKeys: Array.from(this.foundConfigValuesCache.keys()),
    };
  }

  onModuleDestroy() {
    this.clearAll();
  }

  getAllKeys(): ConfigKey[] {
    const foundKeys = Array.from(this.foundConfigValuesCache.keys());
    const missingKeys = Array.from(this.knownMissingKeysCache);

    return [...new Set([...foundKeys, ...missingKeys])];
  }

  /**
   * Helper method for testing edge cases
   */
  addToMissingKeysForTesting(key: ConfigKey): void {
    this.knownMissingKeysCache.add(key);
  }
}
