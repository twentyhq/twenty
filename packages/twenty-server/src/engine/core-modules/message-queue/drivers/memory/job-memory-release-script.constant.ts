export const JOB_MEMORY_RELEASE_SCRIPT = `
-- Releases the memory charged for one job, once it completed, failed for good or was
-- deduplicated. Safe to run twice: a job no longer in a key's hash is skipped.
--
-- KEYS, for each group key i: KEYS[2i - 1] "used" counter, KEYS[2i] "jobs" hash
-- ARGV[1]: the job's member, "<queue>:<jobId>"

local member = ARGV[1]
local released = 0

for keyIndex = 1, #KEYS / 2 do
  -- The size stored at admission, so the exact amount charged is given back
  local size = redis.call('HGET', KEYS[2 * keyIndex], member)

  if size then
    redis.call('HDEL', KEYS[2 * keyIndex], member)

    -- Drop the counter once nothing is charged to the key any more
    if redis.call('DECRBY', KEYS[2 * keyIndex - 1], size) <= 0 then
      redis.call('DEL', KEYS[2 * keyIndex - 1])
    end

    released = released + 1
  end
end

return released
`;
