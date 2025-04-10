import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { ConfigVarCacheEntry } from 'src/engine/core-modules/twenty-config/interfaces/config-var-cache-entry.interface';
import { DatabaseConfigDriverInterface } from 'src/engine/core-modules/twenty-config/interfaces/database-config-driver.interface';

import {
    KeyValuePair,
    KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_CACHE_MAX_ENTRIES } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-max-entries';
import { CONFIG_VARIABLES_CACHE_SCAVENGE_INTERVAL } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-scavenge-interval';
import { CONFIG_VARIABLES_CACHE_TTL } from 'src/engine/core-modules/twenty-config/constants/config-variables-cache-ttl';
import { DATABASE_CONFIG_DRIVER_INITIAL_RETRY_DELAY } from 'src/engine/core-modules/twenty-config/constants/database-config-driver-initial-retry-delay';
import { DATABASE_CONFIG_DRIVER_INITIALIZATION_MAX_RETRIES } from 'src/engine/core-modules/twenty-config/constants/database-config-driver-initialization-max-retries';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { InitializationState } from 'src/engine/core-modules/twenty-config/enums/initialization-state.enum';
import { convertConfigVarToAppType } from 'src/engine/core-modules/twenty-config/utils/convert-config-var-to-app-type.util';
import { convertConfigVarToStorageType } from 'src/engine/core-modules/twenty-config/utils/convert-config-var-to-storage-type.util';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

@Injectable()
export class DatabaseConfigDriver
  implements DatabaseConfigDriverInterface, OnModuleDestroy
{
  private readonly valueCache: Map<string, ConfigVarCacheEntry<any>>;
  private readonly negativeLookupCache: Map<
    string,
    ConfigVarCacheEntry<boolean>
  >;
  private initializationState = InitializationState.NOT_INITIALIZED;
  private initializationPromise: Promise<void> | null = null;
  private retryAttempts = 0;
  private cacheScavengeInterval: NodeJS.Timeout;
  private readonly logger = new Logger(DatabaseConfigDriver.name);

  constructor(
    private readonly environmentDriver: EnvironmentConfigDriver,
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

  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] {
    // 1. If in not-initialized or initializing state, use environment variable
    if (this.initializationState !== InitializationState.INITIALIZED) {
      this.logger.debug(
        `[Cache:${key}] Using env due to initialization state: ${this.initializationState}`,
      );

      return this.environmentDriver.get(key);
    }

    // 2. Check if this is an environment-only variable
    if (isEnvOnlyConfigVar(key)) {
      this.logger.debug(`[Cache:${key}] Using env due to isEnvOnly flag`);

      return this.environmentDriver.get(key);
    }

    // 3. Check negative lookup cache first (quick rejection)
    const negativeCacheEntry = this.negativeLookupCache.get(key as string);

    if (negativeCacheEntry && !this.isCacheExpired(negativeCacheEntry)) {
      this.logger.debug(`🔴 [Cache:${key}] Negative cache hit - using env`);

      return this.environmentDriver.get(key);
    }

    // 4. Check value cache
    const valueCacheEntry = this.valueCache.get(key as string);

    if (valueCacheEntry && !this.isCacheExpired(valueCacheEntry)) {
      this.logger.debug(
        `🟢 [Cache:${key}] Positive cache hit - using cached value`,
      );

      // Convert the value to the appropriate type before returning
      return convertConfigVarToAppType(valueCacheEntry.value, key);
    }

    // 5. Schedule background refresh - Cache miss
    this.logger.debug(`🟡 [Cache:${key}] Cache miss - scheduling refresh`);

    this.scheduleRefresh(key).catch((error) => {
      this.logger.error(`Failed to refresh config for ${key as string}`, error);
    });

    // 6. Return environment value immediately
    return this.environmentDriver.get(key);
  }

  async refreshConfig(key: keyof ConfigVariables): Promise<void> {
    try {
      this.logger.debug(`🔄 [Cache:${key}] Refreshing from database`);

      const result = await this.queryDatabase(key as string);

      if (result !== undefined) {
        // Store the original value in the cache
        this.valueCache.set(key as string, {
          value: result,
          timestamp: Date.now(),
          ttl: CONFIG_VARIABLES_CACHE_TTL,
        });
        this.negativeLookupCache.delete(key as string);
        this.logger.debug(
          `✅ [Cache:${key}] Updated positive cache with value from DB`,
        );
      } else {
        this.negativeLookupCache.set(key as string, {
          value: true,
          timestamp: Date.now(),
          ttl: CONFIG_VARIABLES_CACHE_TTL,
        });
        this.valueCache.delete(key as string);
        this.logger.debug(
          `❌ [Cache:${key}] Updated negative cache (not found in DB)`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to refresh config for ${key as string}`, error);
    }
  }

  async update<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    try {
      // Convert the value to JSON storage format using the converter
      // TODO: same here. More clean way would be to have a non json table for config vars, which means a new table just for the config vars
      // TODO: and then we can just store the value as is, without converting to json
      // or can we store the type of value win the json?
      const processedValue = convertConfigVarToStorageType(value);

      this.logger.debug(`🔵 [Cache:${key}] Updating in database`, {
        originalType: typeof value,
        processedType: typeof processedValue,
        isArray: Array.isArray(processedValue),
      });

      // Check if the record exists
      const existingRecord = await this.keyValuePairRepository.findOne({
        where: {
          key: key as string,
          userId: IsNull(),
          workspaceId: IsNull(),
          type: KeyValuePairType.CONFIG_VARIABLE,
        },
      });

      if (existingRecord) {
        // Update existing record
        this.logger.debug(`🔄 [Cache:${key}] Updating existing record in DB`);
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
        this.logger.debug(`🔄 [Cache:${key}] Inserting new record in DB`);
        await this.keyValuePairRepository.insert({
          key: key as string,
          value: processedValue,
          userId: null,
          workspaceId: null,
          type: KeyValuePairType.CONFIG_VARIABLE,
        });
      }

      // Update cache immediately with the properly converted value
      this.valueCache.set(key as string, {
        value: processedValue,
        timestamp: Date.now(),
        ttl: CONFIG_VARIABLES_CACHE_TTL,
      });
      this.negativeLookupCache.delete(key as string);
      this.logger.debug(`✅ [Cache:${key}] Updated cache with new value`);
    } catch (error) {
      this.logger.error(`Failed to update config for ${key as string}`, error);
      throw error;
    }
  }

  clearCache(key: keyof ConfigVariables): void {
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

  private async scheduleRefresh(key: keyof ConfigVariables): Promise<void> {
    // Log when a refresh is scheduled but not yet executed
    this.logger.debug(`🕒 [Cache:${key}] Scheduling background refresh`);

    setImmediate(() => {
      this.logger.debug(`⏳ [Cache:${key}] Executing background refresh`);

      this.refreshConfig(key).catch((error) => {
        this.logger.error(
          `Failed to refresh config for ${key as string}`,
          error,
        );
      });
    });

    return Promise.resolve();
  }

  private scheduleRetry(): void {
    if (
      this.retryAttempts >= DATABASE_CONFIG_DRIVER_INITIALIZATION_MAX_RETRIES
    ) {
      this.logger.error('Max retry attempts reached, giving up initialization');

      return;
    }

    const delay =
      DATABASE_CONFIG_DRIVER_INITIAL_RETRY_DELAY *
      Math.pow(2, this.retryAttempts);

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
          type: KeyValuePairType.CONFIG_VARIABLE,
          userId: IsNull(),
          workspaceId: IsNull(),
        },
      });

      if (!configVars.length) {
        return;
      }

      const now = Date.now();

      for (const configVar of configVars) {
        if (configVar.value !== null) {
          this.valueCache.set(configVar.key, {
            value: configVar.value,
            timestamp: now,
            ttl: CONFIG_VARIABLES_CACHE_TTL,
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
          type: KeyValuePairType.CONFIG_VARIABLE,
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

  private isCacheExpired(entry: ConfigVarCacheEntry<any>): boolean {
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

    // THis is some thing I added later not in the design doc
    // makes sense tho, because we don't want to have too many cache entries
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
        `Cache scavenging completed: ${expiredCount} expired entries removed, ${sizeLimitedCount} entries removed due to size limits`,
      );
    }
  }

  getFromValueCache(key: string): any {
    const entry = this.valueCache.get(key);

    if (entry && !this.isCacheExpired(entry)) {
      // again same type conversion -- I don't like it
      return convertConfigVarToAppType(
        entry.value,
        key as keyof ConfigVariables,
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
