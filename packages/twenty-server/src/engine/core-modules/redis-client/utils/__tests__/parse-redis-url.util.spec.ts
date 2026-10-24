import { parseRedisUrl } from 'src/engine/core-modules/redis-client/utils/parse-redis-url.util';

describe('parseRedisUrl', () => {
  it('should parse standard TCP redis URL', () => {
    const result = parseRedisUrl('redis://localhost:6379');

    expect(result.isUnixSocket).toBe(false);
    if (!result.isUnixSocket) {
      expect(result.url).toBe('redis://localhost:6379');
      expect(result.nodeRedisUrl).toBe('redis://localhost:6379');
      expect(result.ioRedisOptions.maxRetriesPerRequest).toBeNull();
    }
  });

  it('should parse unix socket with unix:// scheme', () => {
    const result = parseRedisUrl('unix:///var/run/redis/redis.sock');

    expect(result.isUnixSocket).toBe(true);
    if (result.isUnixSocket) {
      expect(result.socketPath).toBe('/var/run/redis/redis.sock');
      expect(result.ioRedisOptions.path).toBe('/var/run/redis/redis.sock');
      expect(result.nodeRedisSocketOptions.path).toBe('/var/run/redis/redis.sock');
      expect(result.db).toBeUndefined();
    }
  });

  it('should parse unix socket with db query parameter', () => {
    const result = parseRedisUrl('unix:///tmp/redis.sock?db=3');

    expect(result.isUnixSocket).toBe(true);
    if (result.isUnixSocket) {
      expect(result.socketPath).toBe('/tmp/redis.sock');
      expect(result.db).toBe(3);
      expect(result.ioRedisOptions.path).toBe('/tmp/redis.sock');
      expect(result.ioRedisOptions.db).toBe(3);
      expect(result.nodeRedisSocketOptions.path).toBe('/tmp/redis.sock');
    }
  });

  it('should parse direct unix socket file path without scheme', () => {
    const result = parseRedisUrl('/var/run/redis.sock');

    expect(result.isUnixSocket).toBe(true);
    if (result.isUnixSocket) {
      expect(result.socketPath).toBe('/var/run/redis.sock');
      expect(result.ioRedisOptions.path).toBe('/var/run/redis.sock');
      expect(result.nodeRedisSocketOptions.path).toBe('/var/run/redis.sock');
    }
  });
});
