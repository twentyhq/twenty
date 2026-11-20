import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const REFRESH_OPEN_TAB_SCRIPT: CacheScript = {
  name: 'refresh-open-tab',
  source: `
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1])
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[3])
return redis.call('PEXPIRE', KEYS[1], ARGV[4])
`,
};
