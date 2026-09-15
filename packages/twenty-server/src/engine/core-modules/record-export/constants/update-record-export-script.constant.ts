import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const UPDATE_RECORD_EXPORT_SCRIPT: CacheScript = {
  name: 'record-export:update',
  source: `
local value = redis.call('HGET', KEYS[1], 'state')
if not value then return 0 end
local state = cjson.decode(value)
local condition = cjson.decode(ARGV[2])
if condition.statuses then
  local matches = false
  for _, status in ipairs(condition.statuses) do
    if state.status == status then matches = true end
  end
  if not matches then return 0 end
end
if condition.attemptId ~= nil and state.attemptId ~= condition.attemptId then
  return 0
end
local changes = cjson.decode(ARGV[3])
for key, value in pairs(changes) do state[key] = value end
redis.call('HSET', KEYS[1], 'state', cjson.encode(state))
if tonumber(ARGV[4]) > 0 then redis.call('PEXPIRE', KEYS[1], ARGV[4]) end
if state.status == 'COMPLETED' or state.status == 'FAILED' then
  if redis.call('GET', KEYS[2]) == ARGV[1] then
    redis.call('DEL', KEYS[2])
  end
end
return 1
`,
};
