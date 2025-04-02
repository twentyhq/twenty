import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { CacheEntry } from 'src/engine/core-modules/environment/interfaces/cache-entry.interface';

import {
  CACHE_SCAVENGE_INTERVAL,
  INITIAL_RETRY_DELAY,
  MAX_CACHE_ENTRIES,
  MAX_RETRY_ATTEMPTS,
  NEGATIVE_CACHE_TTL,
  POSITIVE_CACHE_TTL,
} from 'src/engine/core-modules/environment/constants/cache.constants';
import { ConfigVarValueConverter } from 'src/engine/core-modules/environment/converters/config-var-value.converter';
import { InitializationState } from 'src/engine/core-modules/environment/enums/initialization-state.enum';
import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import {
  KeyValuePair,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

import { ConfigVarDriver } from './config-var-driver.interface';
import { EnvironmentDriver } from './environment.driver';

@Injectable()
export class DatabaseDriver implements ConfigVarDriver, OnModuleDestroy {
  private readonly valueCache: Map<string, CacheEntry<any>>;
  private readonly negativeLookupCache: Map<string, CacheEntry<boolean>>;
  private initializationState = InitializationState.NOT_INITIALIZED;
  private initializationPromise: Promise<void> | null = null;
  private retryAttempts = 0;
  private cacheScavengeInterval: NodeJS.Timeout;
  private readonly logger = new Logger(DatabaseDriver.name);

  constructor(
    private readonly environmentDriver: EnvironmentDriver,
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
  ) {
    this.valueCache = new Map();
    this.negativeLookupCache = new Map();
    this.startCacheScavenging();
  }

  /**
   * Initialize the database driver by loading all config variables from DB
   */
  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve) => {
      this.loadAllConfigVarsFromDb()
        .then(() => {
          this.initializationState = InitializationState.INITIALIZED;
          resolve();
        })
        .catch((error) => {
          this.logger.error('Failed to initialize database driver', error);
          this.initializationState = InitializationState.FAILED;
          this.scheduleRetry();
          // We still resolve the promise to prevent bootstrap from failing
          // The driver will fallback to environment variables when in FAILED state
          resolve();
        });
    });

    return this.initializationPromise;
  }

  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T] {
    // 1. If in not-initialized or initializing state, use environment variable
    if (this.initializationState !== InitializationState.INITIALIZED) {
      this.logger.debug(
        `[Cache:${key}] Using env due to initialization state: ${this.initializationState}`,
      );

      return this.environmentDriver.get(key);
    }

    // 2. Check if this is an environment-only variable
    if (ConfigVarValueConverter.isEnvOnly(key)) {
      this.logger.debug(`[Cache:${key}] Using env due to isEnvOnly flag`);

      return this.environmentDriver.get(key);
    }

    // 3. Check negative lookup cache first (quick rejection)
    const negativeCacheEntry = this.negativeLookupCache.get(key as string);

    if (negativeCacheEntry && !this.isCacheExpired(negativeCacheEntry)) {
      this.logger.debug(`[Cache:${key}] Negative cache hit - using env`);
      console.log(`🔴 CACHE: Negative cache hit for ${key as string}`);

      return this.environmentDriver.get(key);
    }

    // 4. Check value cache
    const valueCacheEntry = this.valueCache.get(key as string);

    if (valueCacheEntry && !this.isCacheExpired(valueCacheEntry)) {
      this.logger.debug(
        `[Cache:${key}] Positive cache hit - using cached value`,
      );
      console.log(`🟢 CACHE: Positive cache hit for ${key as string}`);

      // Convert the value to the appropriate type before returning
      return ConfigVarValueConverter.toAppType(valueCacheEntry.value, key);
    }

    // 5. Schedule background refresh - Cache miss
    this.logger.debug(`[Cache:${key}] Cache miss - scheduling refresh`);
    console.log(
      `🟡 CACHE: Cache miss for ${key as string} - scheduling refresh`,
    );

    this.scheduleRefresh(key).catch((error) => {
      this.logger.error(`Failed to refresh config for ${key as string}`, error);
    });

    // 6. Return environment value immediately
    return this.environmentDriver.get(key);
  }

  async refreshConfig(key: keyof EnvironmentVariables): Promise<void> {
    try {
      this.logger.debug(`[Cache:${key}] Refreshing from database`);
      console.log(`🔄 CACHE: Refreshing ${key as string} from database`);

      const result = await this.queryDatabase(key as string);

      if (result !== undefined) {
        // Store the original value in the cache
        this.valueCache.set(key as string, {
          value: result,
          timestamp: Date.now(),
          ttl: POSITIVE_CACHE_TTL,
        });
        this.negativeLookupCache.delete(key as string);
        this.logger.debug(
          `[Cache:${key}] Updated positive cache with value from DB`,
        );
        console.log(`✅ CACHE: Updated positive cache for ${key as string}`);
      } else {
        this.negativeLookupCache.set(key as string, {
          value: true,
          timestamp: Date.now(),
          ttl: NEGATIVE_CACHE_TTL,
        });
        this.valueCache.delete(key as string);
        this.logger.debug(
          `[Cache:${key}] Updated negative cache (not found in DB)`,
        );
        console.log(
          `❌ CACHE: Updated negative cache for ${key as string} (not found in DB)`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to refresh config for ${key as string}`, error);
    }
  }

  async update<T extends keyof EnvironmentVariables>(
    key: T,
    value: EnvironmentVariables[T],
  ): Promise<void> {
    try {
      // Convert the value to JSON storage format using the converter
      const processedValue = ConfigVarValueConverter.toStorageType(value);

      this.logger.debug(`[Cache:${key}] Updating in database`, {
        originalType: typeof value,
        processedType: typeof processedValue,
        isArray: Array.isArray(processedValue),
      });
      console.log(`🔵 CACHE: Updating ${key as string} in database`);

      // Check if the record exists
      const existingRecord = await this.keyValuePairRepository.findOne({
        where: {
          key: key as string,
          userId: IsNull(),
          workspaceId: IsNull(),
          type: KeyValuePairType.CONFIG_VAR,
        },
      });

      if (existingRecord) {
        // Update existing record
        this.logger.debug(`[Cache:${key}] Updating existing record in DB`);
        await this.keyValuePairRepository.update(
          {
            id: existingRecord.id,
          },
          {
            value: processedValue,
          },
        );
      } else {
        // Insert new record
        this.logger.debug(`[Cache:${key}] Inserting new record in DB`);
        await this.keyValuePairRepository.insert({
          key: key as string,
          value: processedValue,
          userId: null,
          workspaceId: null,
          type: KeyValuePairType.CONFIG_VAR,
        });
      }

      // Update cache immediately with the properly converted value
      this.valueCache.set(key as string, {
        value: processedValue,
        timestamp: Date.now(),
        ttl: POSITIVE_CACHE_TTL,
      });
      this.negativeLookupCache.delete(key as string);
      this.logger.debug(`[Cache:${key}] Updated cache with new value`);
      console.log(
        `✅ CACHE: Updated cache for ${key as string} with new value`,
      );
    } catch (error) {
      this.logger.error(`Failed to update config for ${key as string}`, error);
      throw error;
    }
  }

  clearCache(key: keyof EnvironmentVariables): void {
    this.valueCache.delete(key as string);
    this.negativeLookupCache.delete(key as string);
  }

  clearAllCache(): void {
    this.valueCache.clear();
    this.negativeLookupCache.clear();
  }

  onModuleDestroy() {
    if (this.cacheScavengeInterval) {
      clearInterval(this.cacheScavengeInterval);
    }
  }

  private async scheduleRefresh(
    key: keyof EnvironmentVariables,
  ): Promise<void> {
    return this.refreshConfig(key);
  }

  private scheduleRetry(): void {
    if (this.retryAttempts >= MAX_RETRY_ATTEMPTS) {
      this.logger.error('Max retry attempts reached, giving up initialization');

      return;
    }

    const delay = INITIAL_RETRY_DELAY * Math.pow(2, this.retryAttempts);

    this.retryAttempts++;

    setTimeout(() => {
      this.initializationPromise = null;
      this.initialize().catch((error) => {
        this.logger.error('Retry initialization failed', error);
      });
    }, delay);
  }

  private async loadAllConfigVarsFromDb(): Promise<void> {
    try {
      const configVars = await this.keyValuePairRepository.find({
        where: {
          type: KeyValuePairType.CONFIG_VAR,
          userId: IsNull(),
          workspaceId: IsNull(),
        },
      });

      if (!configVars.length) {
        return;
      }

      // Populate caches
      const now = Date.now();

      for (const configVar of configVars) {
        if (configVar.value !== null) {
          this.valueCache.set(configVar.key, {
            value: configVar.value,
            timestamp: now,
            ttl: POSITIVE_CACHE_TTL,
          });
        }
      }

      this.logger.log(
        `Loaded ${configVars.length} config variables from database`,
      );
    } catch (error) {
      this.logger.error('Failed to load config variables from database', error);
      throw error;
    }
  }

  private async queryDatabase(key: string): Promise<any | undefined> {
    try {
      const result = await this.keyValuePairRepository.findOne({
        where: {
          type: KeyValuePairType.CONFIG_VAR,
          key,
          userId: IsNull(),
          workspaceId: IsNull(),
        },
      });

      return result?.value;
    } catch (error) {
      this.logger.error(`Failed to query database for ${key}`, error);

      return undefined;
    }
  }

  private isCacheExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private startCacheScavenging(): void {
    this.cacheScavengeInterval = setInterval(() => {
      this.scavengeCache();
    }, CACHE_SCAVENGE_INTERVAL);
  }

  private scavengeCache(): void {
    const now = Date.now();

    // Scavenge value cache
    for (const [key, entry] of this.valueCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.valueCache.delete(key);
      }
    }

    // Scavenge negative lookup cache
    for (const [key, entry] of this.negativeLookupCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.negativeLookupCache.delete(key);
      }
    }

    // Enforce size limits
    if (this.valueCache.size > MAX_CACHE_ENTRIES) {
      const entriesToDelete = this.valueCache.size - MAX_CACHE_ENTRIES;
      const keysToDelete = Array.from(this.valueCache.keys()).slice(
        0,
        entriesToDelete,
      );

      keysToDelete.forEach((key) => this.valueCache.delete(key));
    }

    if (this.negativeLookupCache.size > MAX_CACHE_ENTRIES) {
      const entriesToDelete = this.negativeLookupCache.size - MAX_CACHE_ENTRIES;
      const keysToDelete = Array.from(this.negativeLookupCache.keys()).slice(
        0,
        entriesToDelete,
      );

      keysToDelete.forEach((key) => this.negativeLookupCache.delete(key));
    }
  }

  // Add method to access the value cache directly
  getFromValueCache(key: string): any {
    const entry = this.valueCache.get(key);

    if (entry && !this.isCacheExpired(entry)) {
      // Convert the value to the appropriate type before returning
      return ConfigVarValueConverter.toAppType(
        entry.value,
        key as keyof EnvironmentVariables,
      );
    }

    return undefined;
  }

  // Helper method to get cache information for debugging
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
}
