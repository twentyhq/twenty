import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import KeyvRedis from '@keyv/redis';
import { type RedisClientType } from 'redis';
import { v4 } from 'uuid';

import { isDefined } from 'twenty-shared/utils';

import { UPDATE_OWNED_KEY_LEASE_SCRIPT } from 'src/engine/core-modules/cache-storage/constants/update-owned-key-lease-script.constant';
import {
  CacheStorageException,
  CacheStorageExceptionCode,
} from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';
import { type CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { escapeRedisGlob } from 'src/engine/core-modules/cache-storage/utils/escape-redis-glob.util';
import { getCacheStorageKey } from 'src/engine/core-modules/cache-storage/utils/get-cache-storage-key.util';

@Injectable()
export class CacheStorageService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly namespace: CacheStorageNamespace,
    private readonly keyPrefix: string = '',
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cache.get<T>(this.getKey(key));

    return value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cache.set(this.getKey(key), value, ttl);
  }

  async setIfAbsent<T>(key: string, value: T, ttl: number): Promise<boolean> {
    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      const result = await redisClient.set(
        this.getKey(key),
        JSON.stringify(value),
        ttl > 0 ? { NX: true, PX: ttl } : { NX: true },
      );

      return result === 'OK';
    }

    const existingValue = await this.get(key);

    if (existingValue !== undefined) {
      return false;
    }

    await this.set(key, value, ttl);

    return true;
  }

  async del(key: string) {
    return this.cache.del(this.getKey(key));
  }

  async mdel(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      const prefixedKeys = keys.map((k) => this.getKey(k));

      await redisClient.del(prefixedKeys);

      return;
    }

    await Promise.all(keys.map((k) => this.del(k)));
  }

  async mget<T = unknown>(keys: string[]): Promise<(T | undefined)[]> {
    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      const prefixedKeys = keys.map((k) => this.getKey(k));
      const values = await redisClient.mGet(prefixedKeys);

      return values.map((v) => {
        if (v === null || v === undefined) return undefined;
        try {
          return JSON.parse(v) as T;
        } catch {
          return v as T;
        }
      });
    }

    return Promise.all(keys.map((k) => this.get<T>(k)));
  }

  async mset<T = unknown>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
  ): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    await this.cache.mset(
      entries.map(({ key, value, ttl }) => ({
        key: this.getKey(key),
        value,
        ttl,
      })),
    );
  }

  async msetAndMdel<T = unknown>({
    entries,
    keysToDelete,
  }: {
    entries: Array<{ key: string; value: T; ttl?: number }>;
    keysToDelete: string[];
  }): Promise<void> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new CacheStorageException(
        'msetAndMdel is only supported with Redis cache',
        CacheStorageExceptionCode.REDIS_CACHE_REQUIRED,
      );
    }

    const transaction = redisClient.multi();

    for (const { key, value, ttl } of entries) {
      transaction.set(
        this.getKey(key),
        JSON.stringify(value),
        isDefined(ttl) && ttl > 0 ? { PX: ttl } : {},
      );
    }

    if (keysToDelete.length > 0) {
      transaction.del(keysToDelete.map((key) => this.getKey(key)));
    }

    await transaction.exec();
  }

  async setAdd(key: string, value: string[], ttl?: number) {
    if (value.length === 0) {
      return;
    }

    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      await redisClient.sAdd(this.getKey(key), value);

      if (ttl) {
        await redisClient.expire(this.getKey(key), ttl / 1000);
      }

      return;
    }

    const res = await this.get<string[]>(key);

    if (res) {
      await this.set(key, [...res, ...value], ttl);
    } else {
      await this.set(key, value, ttl);
    }
  }

  async setRemove(key: string, values: string[]): Promise<number> {
    if (values.length === 0) {
      return 0;
    }

    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      return redisClient.sRem(this.getKey(key), values);
    }

    const existing = await this.get<string[]>(key);

    if (!existing) {
      return 0;
    }

    const filtered = existing.filter((v) => !values.includes(v));
    const removed = existing.length - filtered.length;

    await this.set(key, filtered);

    return removed;
  }

  async countAllSetMembers(cacheKeys: string[]) {
    return (
      await Promise.all(cacheKeys.map((key) => this.getSetLength(key)))
    ).reduce((acc, setLength) => acc + setLength, 0);
  }

  async setPop(key: string, size = 1) {
    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      return redisClient.sPop(this.getKey(key), size);
    }

    const res = await this.get<string[]>(key);

    if (res) {
      await this.set(key, res.slice(0, -size));

      return res.slice(-size);
    }

    return [];
  }

  async getSetLength(key: string) {
    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      return await redisClient.sCard(this.getKey(key));
    }

    const res = await this.get<string[]>(key);

    return res?.length ?? 0;
  }

  async setMembers(key: string): Promise<string[]> {
    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      return redisClient.sMembers(this.getKey(key));
    }

    return (await this.get<string[]>(key)) ?? [];
  }

  async flush() {
    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      await redisClient.flushDb();

      return;
    }

    await this.cache.clear();
  }

  async flushByPattern(scanPattern: string): Promise<void> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error('flushByPattern is only supported with Redis cache');
    }

    const scanKeyPrefix = escapeRedisGlob(this.getKey(''));
    let cursor = 0;

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: `${scanKeyPrefix}${scanPattern}`,
        COUNT: 100,
      });

      const nextCursor = result.cursor;
      const keys = result.keys;

      if (keys.length > 0) {
        await redisClient.del(keys);
      }

      cursor = nextCursor;
    } while (cursor !== 0);
  }

  async sortedSetAdd(
    key: string,
    entries: Array<{ score: number; value: string }>,
  ): Promise<number> {
    if (entries.length === 0) {
      return 0;
    }

    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error('sortedSetAdd is only supported with Redis cache');
    }

    return redisClient.zAdd(this.getKey(key), entries);
  }

  async sortedSetRemove(key: string, values: string[]): Promise<number> {
    if (values.length === 0) {
      return 0;
    }

    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error('sortedSetRemove is only supported with Redis cache');
    }

    return redisClient.zRem(this.getKey(key), values);
  }

  async sortedSetRemoveByScoreAndCount(
    key: string,
    minScore: number,
    maxScore: number,
  ): Promise<number> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error(
        'sortedSetRemoveByScoreAndCount is only supported with Redis cache',
      );
    }

    const prefixedKey = this.getKey(key);
    const [, count] = await redisClient
      .multi()
      .zRemRangeByScore(prefixedKey, minScore, maxScore)
      .zCard(prefixedKey)
      .exec();

    if (count instanceof Error) {
      throw count;
    }

    return count as number;
  }

  async acquireLock({
    key,
    ttl = 1000,
  }: {
    key: string;
    ttl?: number;
  }): Promise<string | null> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error('acquireLock is only supported with Redis cache');
    }

    const ownerToken = v4();

    const result = await redisClient.set(this.getKey(key), ownerToken, {
      NX: true,
      PX: ttl,
    });

    return result === 'OK' ? ownerToken : null;
  }

  async extendLock({
    key,
    ownerToken,
    ttl,
  }: {
    key: string;
    ownerToken: string;
    ttl: number;
  }): Promise<boolean> {
    const extended = await this.runScript<number>({
      script: UPDATE_OWNED_KEY_LEASE_SCRIPT,
      keys: [key],
      args: [ownerToken, String(ttl)],
    });

    return extended === 1;
  }

  async releaseLock({
    key,
    ownerToken,
  }: {
    key: string;
    ownerToken: string;
  }): Promise<void> {
    await this.runScript<number>({
      script: UPDATE_OWNED_KEY_LEASE_SCRIPT,
      keys: [key],
      args: [ownerToken, '0'],
    });
  }

  async incrBy(key: string, increment: number): Promise<number> {
    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      return redisClient.incrBy(this.getKey(key), increment);
    }

    const current = (await this.get<number>(key)) ?? 0;
    const newValue = current + increment;

    await this.set(key, newValue);

    return newValue;
  }

  async hashGetValues(key: string): Promise<string[]> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error('hashGetValues is only supported with Redis cache');
    }

    return redisClient.hVals(this.getKey(key));
  }

  async hashSet({
    key,
    field,
    value,
  }: {
    key: string;
    field: string;
    value: string;
  }): Promise<number> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error('hashSet is only supported with Redis cache');
    }

    return redisClient.hSet(this.getKey(key), field, value);
  }

  async hashSetIfExists({
    key,
    field,
    value,
  }: {
    key: string;
    field: string;
    value: string;
  }): Promise<number> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error('hashSetIfExists is only supported with Redis cache');
    }

    const script = `
if redis.call('EXISTS', KEYS[1]) == 1 then
  return redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
else
  return 0
end`;

    return redisClient.eval(script, {
      keys: [this.getKey(key)],
      arguments: [field, value],
    }) as Promise<number>;
  }

  async runScript<TResult>({
    script,
    keys,
    args,
  }: {
    script: CacheScript;
    keys: string[];
    args: string[];
  }): Promise<TResult> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new CacheStorageException(
        'runScript is only supported with Redis cache',
        CacheStorageExceptionCode.REDIS_CACHE_REQUIRED,
      );
    }

    try {
      return (await redisClient.eval(script.source, {
        keys: keys.map((key) => this.getKey(key)),
        arguments: args,
      })) as TResult;
    } catch (error) {
      throw new CacheStorageException(
        `Cache script "${script.name}" failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        CacheStorageExceptionCode.SCRIPT_EXECUTION_FAILED,
      );
    }
  }

  async hashSetWithExpire({
    key,
    field,
    value,
    ttlMs,
  }: {
    key: string;
    field: string;
    value: string;
    ttlMs: number;
  }): Promise<void> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error('hashSetWithExpire is only supported with Redis cache');
    }

    const prefixedKey = this.getKey(key);

    await redisClient
      .multi()
      .hSet(prefixedKey, field, value)
      .pExpire(prefixedKey, ttlMs)
      .exec();
  }

  async hashDelete({
    key,
    field,
  }: {
    key: string;
    field: string;
  }): Promise<number> {
    const redisClient = this.getRedisClient();

    if (!isDefined(redisClient)) {
      throw new Error('hashDelete is only supported with Redis cache');
    }

    return redisClient.hDel(this.getKey(key), field);
  }

  async expire(key: string, ttlMs: number): Promise<boolean> {
    const redisClient = this.getRedisClient();

    if (isDefined(redisClient)) {
      return redisClient.expire(this.getKey(key), ttlMs / 1000);
    }

    const existing = await this.get(key);

    if (existing !== undefined) {
      await this.set(key, existing, ttlMs);

      return true;
    }

    return false;
  }

  private getRedisClient(): RedisClientType | undefined {
    const store = this.cache.stores[0]?.store;

    return store instanceof KeyvRedis
      ? (store.client as RedisClientType)
      : undefined;
  }

  private getKey(key: string) {
    return getCacheStorageKey({
      key,
      namespace: this.namespace,
      keyPrefix: this.keyPrefix,
      isTestEnvironment: process.env.NODE_ENV === 'test',
    });
  }
}
