export const JOB_PAYLOAD_RECONCILE_SCRIPT = `
-- Finds stored payloads whose job left BullMQ, finished, or never got this payload. A payload is
-- only returned when two passes in a row find it orphaned, so a payload written just before
-- BullMQ adds its job survives. The caller deletes the file, then the reference.
-- KEYS: refs hash, previous suspects, next suspects, then one BullMQ job key per path
-- ARGV: suspects ttl, then the payload paths. Returns the orphaned paths

local suspectsTtlSeconds = tonumber(ARGV[1])
local orphanedPaths = {}

for index = 2, #ARGV do
  local path = ARGV[index]
  local jobKey = KEYS[2 + index]

  if redis.call('HEXISTS', KEYS[1], path) == 1 then
    local isLive = redis.call('EXISTS', jobKey) == 1
      and redis.call('HEXISTS', jobKey, 'finishedOn') == 0
      and string.find(redis.call('HGET', jobKey, 'data') or '', path, 1, true) ~= nil

    if not isLive then
      if redis.call('SISMEMBER', KEYS[2], path) == 1 then
        table.insert(orphanedPaths, path)
      else
        redis.call('SADD', KEYS[3], path)
        redis.call('EXPIRE', KEYS[3], suspectsTtlSeconds)
      end
    end
  end
end

return orphanedPaths
`;
