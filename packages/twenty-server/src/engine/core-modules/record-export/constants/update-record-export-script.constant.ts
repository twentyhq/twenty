import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const UPDATE_RECORD_EXPORT_SCRIPT: CacheScript = {
  name: 'record-export:update',
  source: `
local current = redis.call('GET', KEYS[1])
if not current then return 0 end
if ARGV[4] ~= '' and redis.call('GET', KEYS[2]) ~= ARGV[4] then return 0 end
if current ~= ARGV[1] then return -1 end
redis.call('SET', KEYS[1], ARGV[2], 'PX', ARGV[3])
if ARGV[4] ~= '' and ARGV[5] == '1' then redis.call('DEL', KEYS[2]) end
return 1
`,
};
