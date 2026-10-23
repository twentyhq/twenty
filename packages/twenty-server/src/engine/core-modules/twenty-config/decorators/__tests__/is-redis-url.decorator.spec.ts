import { validateSync } from 'class-validator';

import { IsRedisUrl } from 'src/engine/core-modules/twenty-config/decorators/is-redis-url.decorator';

describe('IsRedisUrl', () => {
  class ConfigVariables {
    @IsRedisUrl()
    redisUrl: string;
  }

  it.each([
    'redis://localhost:6379',
    'redis://127.0.0.1:6379',
    'redis://user:password@redis.internal:6379/0',
    'rediss://secure-redis.example.com:6380',
    'rediss://:password@10.0.0.1:6379/2',
    'unix:///tmp/redis.sock',
    'unix:///var/run/redis/redis.sock',
    'unix:///var/run/redis/redis.sock?db=1',
    '/var/run/redis/redis.sock',
    '/tmp/redis.sock?db=2',
  ])('should accept valid Redis or Unix socket connection string: %s', (redisUrl) => {
    const config = Object.assign(new ConfigVariables(), { redisUrl });

    expect(validateSync(config)).toHaveLength(0);
  });

  it.each([
    '',
    '   ',
    'http://localhost:6379',
    'https://localhost:6379',
    'ftp://server/path',
    'postgres://user:pass@localhost:5432/db',
    'invalid-url',
  ])('should reject invalid Redis URL: %s', (redisUrl) => {
    const config = Object.assign(new ConfigVariables(), { redisUrl });

    const errors = validateSync(config);

    expect(errors.length).toBeGreaterThan(0);
  });
});
