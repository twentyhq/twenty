import { Logger } from '@nestjs/common';

import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import session from 'express-session';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { SessionStorageType } from 'src/engine/core-modules/session-storage/types/session-storage-type.enum';

export const getSessionStorageOptions = (
  environmentService: EnvironmentService,
): session.SessionOptions => {
  const sessionStorageType = environmentService.get('SESSION_STORAGE_TYPE');

  const sessionStorage = {
    secret: environmentService.get('SESSION_STORE_SECRET'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: environmentService.get('SERVER_URL').startsWith('https'),
    },
  };

  switch (sessionStorageType) {
    case SessionStorageType.Memory: {
      Logger.warn(
        'Memory session storage is not recommended for production. Prefer Redis.',
      );

      return sessionStorage;
    }
    case SessionStorageType.Redis: {
      const host = environmentService.get('REDIS_HOST');
      const port = environmentService.get('REDIS_PORT');

      if (!(host && port)) {
        throw new Error(
          `${sessionStorageType} session storage requires host: ${host} and port: ${port} to be defined, check your .env file`,
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
        `Invalid session-storage (${sessionStorageType}), check your .env file`,
      );
  }
};
