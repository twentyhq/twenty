export const JOB_MEMORY_RECONCILE_SCRIPT = `
-- Releases charges whose BullMQ job no longer exists, finished jobs included until retention removes
-- them. Two passes in a row must miss the job, so a job charged just before BullMQ adds it survives.
-- KEYS: used counter, jobs hash, previous suspects, next suspects, then one BullMQ job key per member
-- ARGV: suspects ttl, then the members ("<queue>:<jobId>"). Returns "releasedCount releasedBytes"

local suspectsTtlSeconds = tonumber(ARGV[1])
local releasedCount = 0
local releasedBytes = 0

for index = 2, #ARGV do
  local member = ARGV[index]
  local jobKey = KEYS[3 + index]
  local size = redis.call('HGET', KEYS[2], member)

  if size then
    -- A job keeps its charge while BullMQ holds its payload, finished or not
    if redis.call('EXISTS', jobKey) == 0 then
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
        redis.call('EXPIRE', KEYS[4], suspectsTtlSeconds)
      end
    end
  end
end

return releasedCount .. ' ' .. releasedBytes
`;
