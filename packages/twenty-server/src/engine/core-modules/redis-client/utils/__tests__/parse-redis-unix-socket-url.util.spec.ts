import { parseRedisUnixSocketUrl } from 'src/engine/core-modules/redis-client/utils/parse-redis-unix-socket-url.util';

describe('parseRedisUnixSocketUrl', () => {
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
      database: 3,
      username: 'app',
      password: 'p+ss#word',
    });
  });

  it('should leave out empty credentials', () => {
    expect(
      parseRedisUnixSocketUrl('unix:///tmp/redis.sock?username=&password='),
    ).toEqual({ path: '/tmp/redis.sock' });
  });

  it.each([
    ['a TCP URL', 'redis://localhost:6379'],
    ['no path', 'unix:///'],
    ['a host, e.g. a missing slash', 'unix://var/run/redis.sock'],
    ['userinfo', 'unix://user:secret@localhost/tmp/redis.sock'],
    ['a fragment', 'unix:///tmp/redis.sock?password=ab#cd'],
    ['an unknown parameter', 'unix:///tmp/redis.sock?keyPrefix=twenty'],
    ['a repeated parameter', 'unix:///tmp/redis.sock?db=1&db=2'],
    ['a database that is not a number', 'unix:///tmp/redis.sock?db=two'],
    ['a path with a space', 'unix:///run/my redis.sock'],
    ['a path with dot segments', 'unix:///run/link/../redis.sock'],
  ])('should return null for %s', (_, url) => {
    expect(parseRedisUnixSocketUrl(url)).toBeNull();
  });
});
