import type { RedisOptions } from 'ioredis';

export type ParsedRedisUrl =
  | {
      isUnixSocket: true;
      socketPath: string;
      db?: number;
      ioRedisOptions: RedisOptions;
      nodeRedisSocketOptions: { path: string };
    }
  | {
      isUnixSocket: false;
      url: string;
      ioRedisOptions: RedisOptions;
      nodeRedisUrl: string;
    };

export const parseRedisUrl = (redisUrl: string): ParsedRedisUrl => {
  const isUnixSocket =
    redisUrl.startsWith('unix://') || redisUrl.startsWith('/');

  if (isUnixSocket) {
    const rawPath = redisUrl.replace(/^unix:\/\//, '');
    const [pathPart, queryPart] = rawPath.split('?');
    const socketPath = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
    const dbParam = queryPart ? new URLSearchParams(queryPart).get('db') : null;
    const db = dbParam ? Number(dbParam) : undefined;

    return {
      isUnixSocket: true,
      socketPath,
      db,
      ioRedisOptions: {
        path: socketPath,
        ...(db !== undefined ? { db } : {}),
        maxRetriesPerRequest: null,
      },
      nodeRedisSocketOptions: {
        path: socketPath,
      },
    };
  }

  return {
    isUnixSocket: false,
    url: redisUrl,
    ioRedisOptions: {
      maxRetriesPerRequest: null,
    },
    nodeRedisUrl: redisUrl,
  };
};
