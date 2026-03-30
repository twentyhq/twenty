import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

import crypto from 'crypto';

import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { CORE_ENTITY_CACHE_KEY } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import {
  CORE_ENTITY_CACHE_KEYS,
  CoreEntityCacheKeyName,
  type CoreEntityCacheDataMap,
} from 'src/engine/core-entity-cache/types/core-entity-cache-key.type';
import { type CoreEntityLocalCacheEntry } from 'src/engine/core-entity-cache/types/core-entity-local-cache-entry.type';

const LOCAL_TTL_MS = 100; // 100ms
const LOCAL_ENTRY_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MEMOIZER_TTL_MS = 10_000; // 10 seconds
const STALE_VERSION_TTL_MS = 5_000; // 5 seconds
const MAX_LOCAL_STALE_VERSIONS = 5;
const MAX_LOCAL_CACHE_ENTRIES = 5_000;
const MIN_EVICT_KEYS = 100;

const NOT_FOUND_SENTINEL = '__CORE_ENTITY_NOT_FOUND__';
type CacheDataType = CoreEntityCacheDataMap[CoreEntityCacheKeyName];
type CacheableValue = CacheDataType | typeof NOT_FOUND_SENTINEL;

@Injectable()
export class CoreEntityCacheService implements OnModuleInit {
  private readonly localCache = new Map<
    string,
    CoreEntityLocalCacheEntry<CacheableValue>
  >();
  private readonly coreEntityCacheProviders = new Map<
    CoreEntityCacheKeyName,
    CoreEntityCacheProvider<CacheDataType>
  >();
  private readonly memoizer = new PromiseMemoizer<CacheableValue>(
    MEMOIZER_TTL_MS,
  );

  private readonly logger = new Logger(CoreEntityCacheService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineCoreEntity)
    private readonly cacheStorage: CacheStorageService,
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  async onModuleInit() {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance } = wrapper;

      if (!isDefined(instance) || typeof instance !== 'object') {
        continue;
      }

      const coreEntityCacheKeyName = this.reflector.get<CoreEntityCacheKeyName>(
        CORE_ENTITY_CACHE_KEY,
        instance.constructor,
      );

      if (
        isDefined(coreEntityCacheKeyName) &&
        instance instanceof CoreEntityCacheProvider
      ) {
        this.coreEntityCacheProviders.set(coreEntityCacheKeyName, instance);
      }
    }
  }

  public async get<K extends CoreEntityCacheKeyName>(
    cacheKeyName: K,
    entityId: string,
  ): Promise<CoreEntityCacheDataMap[K] | null> {
    this.evictExpiredLocalEntries();

    if (!isDefined(entityId) || !isValidUuid(entityId)) {
      return null;
    }

    const memoKey = `${cacheKeyName}-${entityId}` as const;

    const result = await this.memoizer.memoizePromiseAndExecute(
      memoKey,
      async () => {
        const localKey = this.buildCacheKey(entityId, cacheKeyName);
        const localEntry = this.localCache.get(localKey);
        const now = Date.now();

        // Stage 1: Check local TTL
        if (
          isDefined(localEntry) &&
          now - localEntry.lastHashCheckedAt < LOCAL_TTL_MS
        ) {
          const version = localEntry.versions.get(localEntry.latestHash);

          if (isDefined(version)) {
            version.lastReadAt = now;

            return version.data;
          }
        }

        // Stage 2: Validate against Redis hash
        const hashKey = `${localKey}:hash`;
        const redisHash = await this.cacheStorage.get<string>(hashKey);

        if (
          isDefined(localEntry) &&
          isDefined(redisHash) &&
          localEntry.latestHash === redisHash
        ) {
          localEntry.lastHashCheckedAt = now;
          const version = localEntry.versions.get(localEntry.latestHash);

          if (isDefined(version)) {
            version.lastReadAt = now;

            return version.data;
          }
        }

        // Stage 3: Fetch from Redis
        const [redisData, redisDataHash] = await this.cacheStorage.mget<
          CacheableValue | string
        >([`${localKey}:data`, hashKey]);

        if (isDefined(redisData) && isDefined(redisDataHash)) {
          this.setInLocalCache(
            entityId,
            cacheKeyName,
            redisData as CacheableValue,
            redisDataHash as string,
          );

          return redisData as CacheableValue;
        }

        // Stage 4: Recompute from provider
        return this.recomputeFromProvider(entityId, cacheKeyName);
      },
    );

    if (result === NOT_FOUND_SENTINEL || result === null) {
      return null;
    }

    return result as CoreEntityCacheDataMap[K];
  }

  public async invalidate(
    cacheKeyName: CoreEntityCacheKeyName,
    entityId: string,
  ): Promise<void> {
    await this.memoizer.clearKeys(`${cacheKeyName}-${entityId}`);
    await this.flush(entityId, cacheKeyName);
    await this.memoizer.clearKeys(`${cacheKeyName}-${entityId}`);
  }

  public async invalidateAndRecompute(
    cacheKeyName: CoreEntityCacheKeyName,
    entityId: string,
  ): Promise<void> {
    await this.memoizer.clearKeys(`${cacheKeyName}-${entityId}`);
    await this.flush(entityId, cacheKeyName);
    await this.recomputeFromProvider(entityId, cacheKeyName);
    await this.memoizer.clearKeys(`${cacheKeyName}-${entityId}`);
  }

  private async recomputeFromProvider(
    entityId: string,
    cacheKeyName: CoreEntityCacheKeyName,
  ): Promise<CacheableValue> {
    const provider = this.getProviderOrThrow(cacheKeyName);
    const data = await provider.computeForCache(entityId);
    const hash = crypto.randomUUID();

    const valueToCache: CacheableValue =
      data === null ? NOT_FOUND_SENTINEL : data;

    const localKey = this.buildCacheKey(entityId, cacheKeyName);

    await this.cacheStorage.mset<unknown>([
      { key: `${localKey}:hash`, value: hash },
      { key: `${localKey}:data`, value: valueToCache },
    ]);

    this.setInLocalCache(entityId, cacheKeyName, valueToCache, hash);

    return valueToCache;
  }

  private async flush(
    entityId: string,
    cacheKeyName: CoreEntityCacheKeyName,
  ): Promise<void> {
    const localKey = this.buildCacheKey(entityId, cacheKeyName);

    await this.cacheStorage.mdel([`${localKey}:data`, `${localKey}:hash`]);

    const entry = this.localCache.get(localKey);

    if (isDefined(entry)) {
      entry.lastHashCheckedAt = 0;
    }
  }

  private setInLocalCache(
    entityId: string,
    keyName: CoreEntityCacheKeyName,
    data: CacheableValue,
    hash: string,
  ): void {
    const localKey = this.buildCacheKey(entityId, keyName);
    let entry = this.localCache.get(localKey);

    if (!isDefined(entry)) {
      entry = { versions: new Map(), latestHash: '', lastHashCheckedAt: 0 };
      this.localCache.set(localKey, entry);
    }

    entry.versions.set(hash, { data, lastReadAt: Date.now() });
    entry.latestHash = hash;
    entry.lastHashCheckedAt = Date.now();

    this.cleanupStaleVersions(entry);
    this.evictLRUEntriesIfNeeded();
  }

  private evictLRUEntriesIfNeeded(): void {
    if (this.localCache.size <= MAX_LOCAL_CACHE_ENTRIES) {
      return;
    }

    const entries = [...this.localCache.entries()].sort(
      (a, b) => a[1].lastHashCheckedAt - b[1].lastHashCheckedAt,
    );

    const toEvict = entries.slice(
      0,
      Math.max(MIN_EVICT_KEYS, this.localCache.size - MAX_LOCAL_CACHE_ENTRIES),
    );

    for (const [key] of toEvict) {
      this.localCache.delete(key);
    }
  }

  private cleanupStaleVersions(
    entry: CoreEntityLocalCacheEntry<CacheableValue>,
  ): void {
    const now = Date.now();

    for (const [hash, version] of entry.versions) {
      if (
        hash !== entry.latestHash &&
        now - version.lastReadAt > STALE_VERSION_TTL_MS
      ) {
        entry.versions.delete(hash);
      }
    }

    if (entry.versions.size >= MAX_LOCAL_STALE_VERSIONS) {
      const sorted = [...entry.versions.entries()]
        .filter(([hash]) => hash !== entry.latestHash)
        .sort((entryA, entryB) => entryA[1].lastReadAt - entryB[1].lastReadAt);

      while (
        entry.versions.size >= MAX_LOCAL_STALE_VERSIONS &&
        sorted.length > 0
      ) {
        const oldestEntry = sorted.shift();

        if (isDefined(oldestEntry)) {
          entry.versions.delete(oldestEntry[0]);
        }
      }
    }
  }

  private evictExpiredLocalEntries(): void {
    const now = Date.now();

    for (const [localKey, entry] of this.localCache) {
      for (const [hash, version] of entry.versions) {
        if (now - version.lastReadAt > LOCAL_ENTRY_TTL_MS) {
          entry.versions.delete(hash);
        }
      }

      if (entry.versions.size === 0) {
        this.localCache.delete(localKey);
        continue;
      }

      if (!entry.versions.has(entry.latestHash)) {
        this.localCache.delete(localKey);
      }
    }
  }

  private getProviderOrThrow(
    keyName: CoreEntityCacheKeyName,
  ): CoreEntityCacheProvider<CacheDataType> {
    const provider = this.coreEntityCacheProviders.get(keyName);

    if (!isDefined(provider)) {
      throw new Error(
        `Core entity cache provider with key name "${keyName}" not found`,
      );
    }

    return provider;
  }

  private buildCacheKey(
    entityId: string,
    keyName: CoreEntityCacheKeyName,
  ): string {
    return `${CORE_ENTITY_CACHE_KEYS[keyName]}:${entityId}`;
  }
}
