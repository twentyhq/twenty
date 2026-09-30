import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

// Stores row edits and the session version they apply to in one step, so a
// stale tab can neither lose nor reorder edits. Returns 0 on a
// version conflict and -1 when the overlay would exceed its cap.
export const SAVE_RECORD_IMPORT_EDITS_SCRIPT: CacheScript = {
  name: 'record-import:save-edits',
  source: `
local current = redis.call('GET', KEYS[1])
if not current then return 0 end
if tostring(cjson.decode(current).version) ~= ARGV[1] then return 0 end
local newRowCount = 0
for index = 5, #ARGV, 2 do
  if redis.call('HEXISTS', KEYS[2], ARGV[index]) == 0 then
    newRowCount = newRowCount + 1
  end
end
if redis.call('HLEN', KEYS[2]) + newRowCount > tonumber(ARGV[4]) then
  return -1
end
for index = 5, #ARGV, 2 do
  redis.call('HSET', KEYS[2], ARGV[index], ARGV[index + 1])
end
redis.call('SET', KEYS[1], ARGV[2], 'PX', ARGV[3])
redis.call('PEXPIRE', KEYS[2], ARGV[3])
return 1
`,
};
