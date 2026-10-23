import IORedis from 'ioredis';
import { createClient } from 'redis';

import { getNodeRedisConnectionOptions } from 'src/engine/core-modules/redis-client/utils/get-node-redis-connection-options.util';

describe('getNodeRedisConnectionOptions', () => {
  it('should pass a TCP URL through', () => {
    expect(getNodeRedisConnectionOptions('redis://localhost:6379/1')).toEqual({
      url: 'redis://localhost:6379/1',
    });
  });

  it('should turn a unix socket URL into socket options', () => {
    expect(
      getNodeRedisConnectionOptions(
        'unix:///var/run/redis.sock?db=2&password=secret',
      ),
    ).toEqual({
      socket: { path: '/var/run/redis.sock' },
      database: 2,
      password: 'secret',
    });
  });

  it('should give node-redis the same connection ioredis reads from the URL', () => {
    const url = 'unix:///var/run/redis.sock?db=2&username=app&password=p%2Bss';
    const nodeRedisClient = createClient(getNodeRedisConnectionOptions(url));
    const ioRedisClient = new IORedis(url, { lazyConnect: true });

    expect(nodeRedisClient.options).toMatchObject({
      socket: { path: '/var/run/redis.sock' },
      database: 2,
      username: 'app',
      password: 'p+ss',
    });
    expect(ioRedisClient.options).toMatchObject({
      path: '/var/run/redis.sock',
      db: 2,
      username: 'app',
      password: 'p+ss',
    });
  });
});
