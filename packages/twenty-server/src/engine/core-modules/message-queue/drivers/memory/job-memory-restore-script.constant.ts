export const JOB_MEMORY_RESTORE_SCRIPT = `
-- Charges a job back after its removal failed. Limits are not checked, as the job
-- is still stored in Redis. A key already holding the job is left as is.
--
-- KEYS, for each group key i: KEYS[2i - 1] "used" counter, KEYS[2i] "jobs" hash
-- ARGV[1]: the job's member, "<queue>:<jobId>"; ARGV[2]: its size

local member = ARGV[1]
local size = ARGV[2]

for keyIndex = 1, #KEYS / 2 do
  if redis.call('HSETNX', KEYS[2 * keyIndex], member, size) == 1 then
    redis.call('INCRBY', KEYS[2 * keyIndex - 1], size)
  end
end

return 1
`;
