import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { REDIS_UNIX_SOCKET_URL_PARAMETERS } from 'src/engine/core-modules/redis-client/constants/redis-unix-socket-url-parameters.constant';
import { REDIS_UNIX_SOCKET_URL_PROTOCOL } from 'src/engine/core-modules/redis-client/constants/redis-unix-socket-url-protocol.constant';

export type RedisUnixSocketConnection = {
  path: string;
  database?: number;
  username?: string;
  password?: string;
};

// Same form ioredis reads: credentials go in the query string as there is no host.
export const parseRedisUnixSocketUrl = (
  url: string,
): RedisUnixSocketConnection | null => {
  if (!url.startsWith(REDIS_UNIX_SOCKET_URL_PROTOCOL) || !URL.canParse(url)) {
    return null;
  }

  const { host, username, password, hash, pathname, searchParams } = new URL(
    url,
  );
  const parameters = [...searchParams.keys()];
  // ioredis uses the path as written, so reject paths URL parsing rewrites.
  const writtenPath = url
    .slice(REDIS_UNIX_SOCKET_URL_PROTOCOL.length)
    .split('?')[0];
  const database = searchParams.get('db');

  const isValid =
    host === '' &&
    username === '' &&
    password === '' &&
    hash === '' &&
    pathname.length > 1 &&
    pathname === writtenPath &&
    parameters.every((parameter) =>
      REDIS_UNIX_SOCKET_URL_PARAMETERS.includes(parameter),
    ) &&
    new Set(parameters).size === parameters.length &&
    (!isDefined(database) || /^\d{1,9}$/.test(database));

  if (!isValid) {
    return null;
  }

  const socketUsername = searchParams.get('username');
  const socketPassword = searchParams.get('password');

  return {
    path: pathname,
    ...(isDefined(database) && { database: Number(database) }),
    ...(isNonEmptyString(socketUsername) && { username: socketUsername }),
    ...(isNonEmptyString(socketPassword) && { password: socketPassword }),
  };
};
