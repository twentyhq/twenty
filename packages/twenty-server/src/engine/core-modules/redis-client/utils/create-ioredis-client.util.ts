import IORedis, { type RedisOptions } from 'ioredis';
import { isDefined } from 'twenty-shared/utils';

import { parseRedisUnixSocketUrl } from 'src/engine/core-modules/redis-client/utils/parse-redis-unix-socket-url.util';

// ioredis 5.11+ reads unix:// URLs as a host named "unix", so pass the socket as options.
export const createIORedisClient = (url: string, options: RedisOptions) => {
  const unixSocket = parseRedisUnixSocketUrl(url);

  if (!isDefined(unixSocket)) {
    return new IORedis(url, options);
  }

  const { database, ...connection } = unixSocket;

  return new IORedis({ ...options, ...connection, db: database });
};
