export const JOB_MEMORY_RESTORE_SCRIPT = `
-- Charges back a job whose removal failed, unless it finished meanwhile. KEYS: job key, then used/jobs pairs

local member = ARGV[1]
local size = ARGV[2]

if redis.call('EXISTS', KEYS[1]) == 0 or redis.call('HEXISTS', KEYS[1], 'finishedOn') == 1 then
  return 0
end

for keyIndex = 1, (#KEYS - 1) / 2 do
  if redis.call('HSETNX', KEYS[2 * keyIndex + 1], member, size) == 1 then
    redis.call('INCRBY', KEYS[2 * keyIndex], size)
  end
end

return 1
`;
