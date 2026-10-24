import { type RedisClientOptions } from 'redis';
import { isDefined } from 'twenty-shared/utils';

import { parseRedisUnixSocketUrl } from 'src/engine/core-modules/redis-client/utils/parse-redis-unix-socket-url.util';

// node-redis 4 rejects the unix: protocol, so the socket goes in socket options.
export const getNodeRedisConnectionOptions = (
  url: string,
): Pick<
  RedisClientOptions,
  'url' | 'socket' | 'database' | 'username' | 'password'
> => {
  const unixSocket = parseRedisUnixSocketUrl(url);

  if (!isDefined(unixSocket)) {
    return { url };
  }

  const { path, ...credentials } = unixSocket;

  return { socket: { path }, ...credentials };
};
