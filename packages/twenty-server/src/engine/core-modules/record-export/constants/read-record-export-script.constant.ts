import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const READ_RECORD_EXPORT_SCRIPT: CacheScript = {
  name: 'record-export:read',
  source: `
local values = redis.call('HMGET', KEYS[1], 'data', 'state')
if values[2] and tonumber(ARGV[2]) > 0 then
  local state = cjson.decode(values[2])
  if state.status == 'QUEUED' or state.status == 'PROCESSING' then
    redis.call('PEXPIRE', KEYS[1], ARGV[2])
    if redis.call('GET', KEYS[2]) == ARGV[1] then
      redis.call('PEXPIRE', KEYS[2], ARGV[2])
    end
  end
end
return values
`,
};
