// KEYS: (used, jobs) per group key. Idempotent: only a job still in a key's hash is released
export const JOB_MEMORY_RELEASE_SCRIPT = `
local member = ARGV[1]
local released = 0

for keyIndex = 1, #KEYS / 2 do
  local size = redis.call('HGET', KEYS[2 * keyIndex], member)

  if size then
    redis.call('HDEL', KEYS[2 * keyIndex], member)

    if redis.call('DECRBY', KEYS[2 * keyIndex - 1], size) <= 0 then
      redis.call('DEL', KEYS[2 * keyIndex - 1])
    end

    released = released + 1
  end
end

return released
`;
