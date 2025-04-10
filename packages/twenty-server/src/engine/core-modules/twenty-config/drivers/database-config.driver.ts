import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import {
    ConfigKey,
    ConfigValue,
    ConfigVarCacheEntry,
} from 'src/engine/core-modules/twenty-config/interfaces/config-var-cache-entry.interface';
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

interface NegativeLookupCacheEntry {
  value: boolean;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class DatabaseConfigDriver
  implements DatabaseConfigDriverInterface, OnModuleDestroy
{
  private readonly valueCache: Map<ConfigKey, ConfigVarCacheEntry<ConfigKey>>;
  private readonly negativeLookupCache: Map<
    ConfigKey,
    NegativeLookupCacheEntry
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
    if (this.initializationState !== InitializationState.INITIALIZED) {
      this.logger.debug(
        `[Cache:${key}] Using env due to initialization state: ${this.initializationState}`,
      );

      return this.environmentDriver.get(key);
    }

    if (isEnvOnlyConfigVar(key)) {
      this.logger.debug(`[Cache:${key}] Using env due to isEnvOnly flag`);

      return this.environmentDriver.get(key);
    }

    const negativeCacheEntry = this.negativeLookupCache.get(key as ConfigKey);

    if (negativeCacheEntry && !this.isCacheExpired(negativeCacheEntry)) {
      this.logger.debug(`🔴 [Cache:${key}] Negative cache hit - using env`);

      return this.environmentDriver.get(key);
    }

    const valueCacheEntry = this.valueCache.get(key as ConfigKey);

    if (valueCacheEntry && !this.isCacheExpired(valueCacheEntry)) {
      this.logger.debug(
        `🟢 [Cache:${key}] Positive cache hit - using cached value`,
      );

      return convertConfigVarToAppType(valueCacheEntry.value, key);
    }

    this.logger.debug(`🟡 [Cache:${key}] Cache miss - scheduling refresh`);

    this.scheduleRefresh(key).catch((error) => {
      this.logger.error(`Failed to refresh config for ${key as string}`, error);
    });

    return this.environmentDriver.get(key);
  }

  async refreshConfig(key: keyof ConfigVariables): Promise<void> {
    try {
      this.logger.debug(`🔄 [Cache:${key}] Refreshing from database`);

      const result = await this.queryDatabase(key as string);

      if (result !== undefined) {
        this.valueCache.set(key as ConfigKey, {
          value: result,
          timestamp: Date.now(),
          ttl: CONFIG_VARIABLES_CACHE_TTL,
        });
        this.negativeLookupCache.delete(key as ConfigKey);
        this.logger.debug(
          `✅ [Cache:${key}] Updated positive cache with value from DB`,
        );
      } else {
        this.negativeLookupCache.set(key as ConfigKey, {
          value: true,
          timestamp: Date.now(),
          ttl: CONFIG_VARIABLES_CACHE_TTL,
        });
        this.valueCache.delete(key as ConfigKey);
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
      const processedValue = convertConfigVarToStorageType(value);

      this.logger.debug(`🔵 [Cache:${key}] Updating in database`, {
        originalType: typeof value,
        processedType: typeof processedValue,
        isArray: Array.isArray(processedValue),
      });

      const existingRecord = await this.keyValuePairRepository.findOne({
        where: {
          key: key as string,
          userId: IsNull(),
          workspaceId: IsNull(),
          type: KeyValuePairType.CONFIG_VARIABLE,
        },
      });

      if (existingRecord) {
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
        this.logger.debug(`🔄 [Cache:${key}] Inserting new record in DB`);
        await this.keyValuePairRepository.insert({
          key: key as string,
          value: processedValue,
          userId: null,
          workspaceId: null,
          type: KeyValuePairType.CONFIG_VARIABLE,
        });
      }

      this.valueCache.set(key, {
        value,
        timestamp: Date.now(),
        ttl: CONFIG_VARIABLES_CACHE_TTL,
      });
      this.negativeLookupCache.delete(key);
      this.logger.debug(`✅ [Cache:${key}] Updated cache with new value`);
    } catch (error) {
      this.logger.error(`Failed to update config for ${key as string}`, error);
      throw error;
    }
  }

  clearCache(key: keyof ConfigVariables): void {
    this.valueCache.delete(key as ConfigKey);
    this.negativeLookupCache.delete(key as ConfigKey);
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
          const key = configVar.key as keyof ConfigVariables;
          const value = convertConfigVarToAppType(configVar.value, key);

          this.valueCache.set(key, {
            value,
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

  private async queryDatabase(
    key: string,
  ): Promise<ConfigValue<ConfigKey> | undefined> {
    try {
      const result = await this.keyValuePairRepository.findOne({
        where: {
          type: KeyValuePairType.CONFIG_VARIABLE,
          key,
          userId: IsNull(),
          workspaceId: IsNull(),
        },
      });

      if (!result?.value) {
        return undefined;
      }

      return convertConfigVarToAppType(result.value, key as ConfigKey);
    } catch (error) {
      this.logger.error(`Failed to query database for ${key}`, error);

      return undefined;
    }
  }

  private isCacheExpired(
    entry: ConfigVarCacheEntry<ConfigKey> | NegativeLookupCacheEntry,
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
        `Cache scavenging completed: ${expiredCount} expired entries removed, ${sizeLimitedCount} entries removed due to size limits`,
      );
    }
  }

  getFromValueCache<T extends keyof ConfigVariables>(
    key: T,
  ): ConfigVariables[T] | undefined {
    const entry = this.valueCache.get(key as ConfigKey);

    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.valueCache.delete(key as ConfigKey);

      return undefined;
    }

    return entry.value as ConfigVariables[T];
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
}
