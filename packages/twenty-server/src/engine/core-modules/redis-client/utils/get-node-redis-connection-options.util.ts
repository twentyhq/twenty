import { type RedisClientOptions } from 'redis';
import { isDefined } from 'twenty-shared/utils';

import { parseRedisUnixSocketUrl } from 'src/engine/core-modules/redis-client/utils/parse-redis-unix-socket-url.util';

export const getNodeRedisConnectionOptions = (
  url: string,
): RedisClientOptions => {
  const unixSocket = parseRedisUnixSocketUrl(url);

  if (!isDefined(unixSocket)) {
    return { url };
  }

  const { path, db, ...credentials } = unixSocket;

  return { socket: { path }, database: db, ...credentials };
};
