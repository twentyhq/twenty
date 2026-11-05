// KEYS: (used, jobs) per group key. Charges each job once per group key and refuses the batch
// when a key would exceed share * (capacity - memory used by everything else)
export const JOB_MEMORY_ADMIT_SCRIPT = `
local chargeOnRefusal = ARGV[1] == '1'
local capacity = tonumber(ARGV[2])
local usedMemory = tonumber(ARGV[3])
local share = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])
local keyCount = tonumber(ARGV[6])
local jobCount = tonumber(ARGV[7])

local used = {}
local requested = {}

for keyIndex = 1, keyCount do
  used[keyIndex] = tonumber(redis.call('GET', KEYS[2 * keyIndex - 1]) or '0')
  requested[keyIndex] = 0
end

local jobs = {}
local cursor = 8

for jobIndex = 1, jobCount do
  local member = ARGV[cursor]
  local size = tonumber(ARGV[cursor + 1])
  local jobKeyCount = tonumber(ARGV[cursor + 2])
  local keyIndexes = {}

  for position = 1, jobKeyCount do
    local keyIndex = tonumber(ARGV[cursor + 2 + position])

    keyIndexes[position] = keyIndex

    if redis.call('HEXISTS', KEYS[2 * keyIndex], member) == 0 then
      requested[keyIndex] = requested[keyIndex] + size
    end
  end

  jobs[jobIndex] = { member, size, keyIndexes }
  cursor = cursor + 3 + jobKeyCount
end

local refused = 0
local limits = {}

for keyIndex = 1, keyCount do
  local limit = math.max(0, math.floor(share * (capacity - (usedMemory - used[keyIndex]))))

  limits[keyIndex] = limit

  if requested[keyIndex] > 0 and used[keyIndex] + requested[keyIndex] > limit then
    refused = 1
  end
end

local usedAfter = {}

for keyIndex = 1, keyCount do
  usedAfter[keyIndex] = used[keyIndex]
end

if refused == 0 or chargeOnRefusal then
  for _, job in ipairs(jobs) do
    for _, keyIndex in ipairs(job[3]) do
      if redis.call('HSETNX', KEYS[2 * keyIndex], job[1], job[2]) == 1 then
        usedAfter[keyIndex] = redis.call('INCRBY', KEYS[2 * keyIndex - 1], job[2])
      end
    end
  end

  for keyIndex = 1, keyCount do
    if requested[keyIndex] > 0 then
      redis.call('EXPIRE', KEYS[2 * keyIndex - 1], ttl)
      redis.call('EXPIRE', KEYS[2 * keyIndex], ttl)
    end
  end
end

local result = { refused }

for keyIndex = 1, keyCount do
  table.insert(result, used[keyIndex])
  table.insert(result, limits[keyIndex])
  table.insert(result, requested[keyIndex])
  table.insert(result, usedAfter[keyIndex])
end

return table.concat(result, ' ')
`;
