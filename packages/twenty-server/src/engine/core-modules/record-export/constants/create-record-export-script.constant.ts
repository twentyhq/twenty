import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const CREATE_RECORD_EXPORT_SCRIPT: CacheScript = {
  name: 'record-export:create',
  source: `
if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
if not redis.call('SET', KEYS[2], ARGV[1], 'NX', 'PX', ARGV[4]) then
  return 0
end
redis.call('HSET', KEYS[1], 'data', ARGV[2], 'state', ARGV[3])
redis.call('PEXPIRE', KEYS[1], ARGV[4])
return 1
`,
};
