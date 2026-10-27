import { parseRedisUnixSocketUrl } from 'src/engine/core-modules/redis-client/utils/parse-redis-unix-socket-url.util';

describe('parseRedisUnixSocketUrl', () => {
  it('should return null for a TCP URL', () => {
    expect(parseRedisUnixSocketUrl('redis://localhost:6379')).toBeNull();
  });

  it('should read the socket path', () => {
    expect(parseRedisUnixSocketUrl('unix:///var/run/redis.sock')).toEqual({
      path: '/var/run/redis.sock',
    });
  });

  it('should read the database and percent-encoded credentials', () => {
    expect(
      parseRedisUnixSocketUrl(
        'unix:///tmp/redis.sock?db=3&username=app&password=p%2Bss%23word',
      ),
    ).toEqual({
      path: '/tmp/redis.sock',
      db: 3,
      username: 'app',
      password: 'p+ss#word',
    });
  });
});
