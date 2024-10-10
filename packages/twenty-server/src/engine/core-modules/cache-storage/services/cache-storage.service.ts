import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import { RedisCache } from 'cache-manager-redis-yet';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

@Injectable()
export class CacheStorageService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly namespace: CacheStorageNamespace,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get(`${this.namespace}:${key}`);
  }

  async set<T>(key: string, value: T, ttl?: number) {
    return this.cache.set(`${this.namespace}:${key}`, value, ttl);
  }

  async del(key: string) {
    return this.cache.del(`${this.namespace}:${key}`);
  }

  async setAdd(key: string, value: string[]) {
    if (value.length === 0) {
      return;
    }
    if (this.isRedisCache()) {
      return (this.cache as RedisCache).store.client.sAdd(
        `${this.namespace}:${key}`,
        value,
      );
    }
    this.get(key).then((res: string[]) => {
      if (res) {
        this.set(key, [...res, ...value]);
      } else {
        this.set(key, value);
      }
    });
  }

  async setPop(key: string, size = 1) {
    if (this.isRedisCache()) {
      return (this.cache as RedisCache).store.client.sPop(
        `${this.namespace}:${key}`,
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
        MATCH: scanPattern,
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

  private isRedisCache() {
    return (this.cache.store as any)?.name === 'redis';
  }
}
