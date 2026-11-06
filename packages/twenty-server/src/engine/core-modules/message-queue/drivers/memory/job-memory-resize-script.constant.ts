export const JOB_MEMORY_RESIZE_SCRIPT = `
-- Updates the charge of a running job whose payload changed (job.updateData), so each
-- key's counter follows the size actually stored. Jobs that were never charged are skipped.
--
-- KEYS, for each group key i: KEYS[2i - 1] "used" counter, KEYS[2i] "jobs" hash
-- ARGV[1]: the job's member, "<queue>:<jobId>"
-- ARGV[2]: the job's new size in bytes
-- ARGV[3]: ttl in seconds

local member = ARGV[1]
local size = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])
local resized = 0

for keyIndex = 1, #KEYS / 2 do
  local previousSize = redis.call('HGET', KEYS[2 * keyIndex], member)

  if previousSize then
    -- Store the new size and move the counter by the difference (can be negative)
    redis.call('HSET', KEYS[2 * keyIndex], member, size)
    redis.call('INCRBY', KEYS[2 * keyIndex - 1], size - tonumber(previousSize))
    redis.call('EXPIRE', KEYS[2 * keyIndex - 1], ttl)
    redis.call('EXPIRE', KEYS[2 * keyIndex], ttl)
    resized = resized + 1
  end
end

return resized
`;
