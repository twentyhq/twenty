import { validateSync } from 'class-validator';

import { IsRedisUrl } from 'src/engine/core-modules/twenty-config/decorators/is-redis-url.decorator';

describe('IsRedisUrl', () => {
  class ConfigVariables {
    @IsRedisUrl()
    url: string;
  }

  it.each([
    'redis://localhost:6379',
    'rediss://user:password@redis.example.com:6380/1',
    'redis://redis_server:6379',
    'unix:///var/run/redis.sock?db=2&password=secret',
  ])('should accept %s', (url) => {
    const config = Object.assign(new ConfigVariables(), { url });

    expect(validateSync(config)).toHaveLength(0);
  });

  it.each([
    '',
    'http://localhost:6379',
    'unix:///',
    'unix://var/run/redis.sock',
  ])('should reject %s', (url) => {
    const config = Object.assign(new ConfigVariables(), { url });

    expect(validateSync(config)).toHaveLength(1);
  });
});
