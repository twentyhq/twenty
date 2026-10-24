import { createIORedisClient } from 'src/engine/core-modules/redis-client/utils/create-ioredis-client.util';

describe('createIORedisClient', () => {
  it('should pass a TCP URL to ioredis', () => {
    const client = createIORedisClient('redis://localhost:6380/1', {
      lazyConnect: true,
    });

    expect(client.options).toMatchObject({
      host: 'localhost',
      port: 6380,
      db: 1,
    });
  });

  it('should connect to a unix socket URL through socket options', () => {
    const client = createIORedisClient(
      'unix:///var/run/redis.sock?db=2&username=app&password=p%2Bss',
      { lazyConnect: true, maxRetriesPerRequest: null },
    );

    expect(client.options).toMatchObject({
      path: '/var/run/redis.sock',
      db: 2,
      username: 'app',
      password: 'p+ss',
      maxRetriesPerRequest: null,
    });
  });
});
