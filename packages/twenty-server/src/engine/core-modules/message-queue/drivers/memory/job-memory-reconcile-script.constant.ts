export const JOB_MEMORY_RECONCILE_SCRIPT = `
-- Releases charges whose job left BullMQ without a release (admin delete, queue clean,
-- lost release). A charge is only released when two passes in a row find no live job,
-- so a job charged just before BullMQ added it is never released by mistake.
--
-- KEYS[1]: "used" counter of the group key
-- KEYS[2]: "jobs" hash of the group key
-- KEYS[3]: suspects of the previous pass (members found without a live job)
-- KEYS[4]: suspects of this pass
-- KEYS[4 + i]: BullMQ job key of the i-th member
-- ARGV[1]: ttl of the suspects set, in seconds
-- ARGV[1 + i]: the i-th member, "<queue>:<jobId>"
-- Returns "releasedCount releasedBytes"

local ttl = tonumber(ARGV[1])
local releasedCount = 0
local releasedBytes = 0

for index = 2, #ARGV do
  local member = ARGV[index]
  local jobKey = KEYS[3 + index]
  local size = redis.call('HGET', KEYS[2], member)

  if size then
    -- A job is live while BullMQ holds it and has not finished it
    local isLive = redis.call('EXISTS', jobKey) == 1
      and redis.call('HEXISTS', jobKey, 'finishedOn') == 0

    if not isLive then
      if redis.call('SISMEMBER', KEYS[3], member) == 1 then
        -- Already missing on the previous pass: give its size back to the key
        redis.call('HDEL', KEYS[2], member)

        if redis.call('DECRBY', KEYS[1], size) <= 0 then
          redis.call('DEL', KEYS[1])
        end

        releasedCount = releasedCount + 1
        releasedBytes = releasedBytes + tonumber(size)
      else
        -- First time missing: check it again on the next pass
        redis.call('SADD', KEYS[4], member)
        redis.call('EXPIRE', KEYS[4], ttl)
      end
    end
  end
end

return releasedCount .. ' ' .. releasedBytes
`;
