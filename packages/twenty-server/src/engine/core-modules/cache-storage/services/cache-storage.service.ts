import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { type Milliseconds } from 'cache-manager';
import { type RedisCache } from 'cache-manager-redis-yet';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

@Injectable()
export class CacheStorageService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly namespace: CacheStorageNamespace,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cache.get<T>(this.getKey(key));

    return value;
  }

  async set<T>(key: string, value: T, ttl?: Milliseconds) {
    return this.cache.set(this.getKey(key), value, ttl);
  }

  async del(key: string) {
    return this.cache.del(this.getKey(key));
  }

  async mdel(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    if (this.isRedisCache()) {
      const prefixedKeys = keys.map((k) => this.getKey(k));

      await (this.cache as RedisCache).store.client.del(prefixedKeys);

      return;
    }

    await Promise.all(keys.map((k) => this.del(k)));
  }

  async mget<T = unknown>(keys: string[]): Promise<(T | undefined)[]> {
    if (this.isRedisCache()) {
      const prefixedKeys = keys.map((k) => this.getKey(k));
      const values = await (this.cache as RedisCache).store.client.mGet(
        prefixedKeys,
      );

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
    entries: Array<{ key: string; value: T; ttl?: Milliseconds }>,
  ): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    await Promise.all(
      entries.map(({ key, value, ttl }) => this.set(key, value, ttl)),
    );
  }

  async setAdd(key: string, value: string[], ttl?: Milliseconds) {
    if (value.length === 0) {
      return;
    }

    if (this.isRedisCache()) {
      await (this.cache as RedisCache).store.client.sAdd(
        this.getKey(key),
        value,
      );

      if (ttl) {
        await (this.cache as RedisCache).store.client.expire(
          this.getKey(key),
          ttl / 1000,
        );
      }

      return;
    }

    this.get(key).then((res: string[]) => {
      if (res) {
        this.set(key, [...res, ...value], ttl);
      } else {
        this.set(key, value, ttl);
      }
    });
  }

  async countAllSetMembers(cacheKeys: string[]) {
    return (
      await Promise.all(cacheKeys.map((key) => this.getSetLength(key) || 0))
    ).reduce((acc, setLength) => acc + setLength, 0);
  }

  async setPop(key: string, size = 1) {
    if (this.isRedisCache()) {
      return (this.cache as RedisCache).store.client.sPop(
        this.getKey(key),
        size,
      );
    }

    return this.get(key).then((res: string[]) => {
      if (res) {
        this.set(key, res.slice(0, -size));

        return res.slice(-size);
      }

      return [];
    });
  }

  async getSetLength(key: string) {
    if (this.isRedisCache()) {
      return await (this.cache as RedisCache).store.client.sCard(
        this.getKey(key),
      );
    }

    return this.get(key).then((res: string[]) => {
      return res.length;
    });
  }

  async flush() {
    return this.cache.reset();
  }

  async flushByPattern(scanPattern: string): Promise<void> {
    if (!this.isRedisCache()) {
      throw new Error('flushByPattern is only supported with Redis cache');
    }

    const redisClient = (this.cache as RedisCache).store.client;
    let cursor = 0;

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: `${this.namespace}:${scanPattern}`,
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

  async acquireLock(key: string, ttl = 1000): Promise<boolean> {
    if (!this.isRedisCache()) {
      throw new Error('acquireLock is only supported with Redis cache');
    }

    const redisClient = (this.cache as RedisCache).store.client;

    const result = await redisClient.set(this.getKey(key), 'lock', {
      NX: true,
      PX: ttl,
    });

    return result === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    if (!this.isRedisCache()) {
      throw new Error('releaseLock is only supported with Redis cache');
    }

    await this.del(key);
  }

  async incrBy(key: string, increment: number): Promise<number> {
    if (this.isRedisCache()) {
      return (this.cache as RedisCache).store.client.incrBy(
        this.getKey(key),
        increment,
      );
    }

    const current = (await this.get<number>(key)) ?? 0;
    const newValue = current + increment;

    await this.set(key, newValue);

    return newValue;
  }

  private isRedisCache() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.cache.store as any)?.name === 'redis';
  }

  private getKey(key: string) {
    const formattedKey = `${this.namespace}:${key}`;

    if (process.env.NODE_ENV === 'test') {
      return `integration-tests:${formattedKey}`;
    }

    return formattedKey;
  }
}
