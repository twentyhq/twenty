// KEYS: (used, jobs) per group key. Moves a charged job to its new size, ignores uncharged jobs
export const JOB_MEMORY_RESIZE_SCRIPT = `
local member = ARGV[1]
local size = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])
local resized = 0

for keyIndex = 1, #KEYS / 2 do
  local previousSize = redis.call('HGET', KEYS[2 * keyIndex], member)

  if previousSize then
    redis.call('HSET', KEYS[2 * keyIndex], member, size)
    redis.call('INCRBY', KEYS[2 * keyIndex - 1], size - tonumber(previousSize))
    redis.call('EXPIRE', KEYS[2 * keyIndex - 1], ttl)
    redis.call('EXPIRE', KEYS[2 * keyIndex], ttl)
    resized = resized + 1
  end
end

return resized
`;
