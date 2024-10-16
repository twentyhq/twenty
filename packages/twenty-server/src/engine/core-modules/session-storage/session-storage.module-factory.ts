import { Logger } from '@nestjs/common';

import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import session from 'express-session';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { CacheStorageType } from 'src/engine/core-modules/cache-storage/types/cache-storage-type.enum';

export const getSessionStorageOptions = (
  environmentService: EnvironmentService,
): session.SessionOptions => {
  const cacheStorageType = environmentService.get('CACHE_STORAGE_TYPE');

  const SERVER_URL = environmentService.get('SERVER_URL');

  const sessionStorage = {
    secret: environmentService.get('SESSION_STORE_SECRET'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: !!(SERVER_URL && SERVER_URL.startsWith('https')),
      maxAge: 1000 * 60 * 30, // 30 minutes
    },
  };

  switch (cacheStorageType) {
    case CacheStorageType.Memory: {
      Logger.warn(
        'Memory session storage is not recommended for production. Prefer Redis.',
      );

      return sessionStorage;
    }
    case CacheStorageType.Redis: {
      const host = environmentService.get('REDIS_HOST');
      const port = environmentService.get('REDIS_PORT');

      if (!(host && port)) {
        throw new Error(
          `${cacheStorageType} session storage requires host: ${host} and port: ${port} to be defined, check your .env file`,
        );
      }

      const username = environmentService.get('REDIS_USERNAME');
      const password = environmentService.get('REDIS_PASSWORD');

      const redisClient = createClient({
        socket: {
          host,
          port,
        },
        username,
        password,
      });

      redisClient.connect().catch((err) => {
        throw new Error(`Redis connection failed: ${err}`);
      });

      return {
        ...sessionStorage,
        store: new RedisStore({
          client: redisClient,
          prefix: 'engine:session:',
        }),
      };
    }
    default:
      throw new Error(
        `Invalid session-storage (${cacheStorageType}), check your .env file`,
      );
  }
};
