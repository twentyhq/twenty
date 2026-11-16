export const JOB_MEMORY_ADMIT_SCRIPT = `
-- Admits a batch of jobs against the memory share of each group key (workspace, application),
-- and charges them only if every key stays within its limit. Runs atomically in Redis.
--
-- KEYS, for each group key i:
--   KEYS[2i - 1]: "used" counter, total bytes currently charged to the key
--   KEYS[2i]:     "jobs" hash, one field per charged job ("<queue>:<jobId>") holding its size
--
-- ARGV:
--   1: capacity, bytes of Redis memory given to jobs (maxmemory minus the reserve)
--   2: used memory, bytes Redis reports as used right now
--   3: key count K
--   4 .. 3 + K: share of the free memory each key may use (0.1 = 10%)
--   4 + K: job count, then for each job: member, size, number of keys, key indexes
--
-- Charges never expire: they last until the job is released or job-memory:reconcile
-- finds its BullMQ job gone or finished.

local capacity = tonumber(ARGV[1])
local usedMemory = tonumber(ARGV[2])
local keyCount = tonumber(ARGV[3])

local shares = {}
local used = {}
local requested = {}

-- Read what each key already holds
for keyIndex = 1, keyCount do
  shares[keyIndex] = tonumber(ARGV[3 + keyIndex])
  used[keyIndex] = tonumber(redis.call('GET', KEYS[2 * keyIndex - 1]) or '0')
  requested[keyIndex] = 0
end

local jobCount = tonumber(ARGV[4 + keyCount])
local jobs = {}
local cursor = 5 + keyCount

-- Sum, per key, the bytes the batch would add. A job already charged to a key,
-- or listed earlier in this batch (same id enqueued twice), is not counted again.
local counted = {}

for jobIndex = 1, jobCount do
  local member = ARGV[cursor]
  local size = tonumber(ARGV[cursor + 1])
  local jobKeyCount = tonumber(ARGV[cursor + 2])
  local keyIndexes = {}

  for position = 1, jobKeyCount do
    local keyIndex = tonumber(ARGV[cursor + 2 + position])

    keyIndexes[position] = keyIndex

    local countedKey = keyIndex .. ':' .. member

    if not counted[countedKey] and redis.call('HEXISTS', KEYS[2 * keyIndex], member) == 0 then
      counted[countedKey] = true
      requested[keyIndex] = requested[keyIndex] + size
    end
  end

  jobs[jobIndex] = { member, size, keyIndexes }
  cursor = cursor + 3 + jobKeyCount
end

-- A key may use its share of the memory every other key leaves free:
-- limit = share * (capacity - (used memory - what this key holds)).
-- The batch is refused if any key would go over its limit.
local refused = 0
local limits = {}

for keyIndex = 1, keyCount do
  local limit = math.max(0, math.floor(shares[keyIndex] * (capacity - (usedMemory - used[keyIndex]))))

  limits[keyIndex] = limit

  if requested[keyIndex] > 0 and used[keyIndex] + requested[keyIndex] > limit then
    refused = 1
  end
end

local usedAfter = {}

for keyIndex = 1, keyCount do
  usedAfter[keyIndex] = used[keyIndex]
end

-- Admitted: record each job in every key's hash (HSETNX skips jobs already
-- charged) and add its size to the key's counter
if refused == 0 then
  for _, job in ipairs(jobs) do
    for _, keyIndex in ipairs(job[3]) do
      if redis.call('HSETNX', KEYS[2 * keyIndex], job[1], job[2]) == 1 then
        usedAfter[keyIndex] = redis.call('INCRBY', KEYS[2 * keyIndex - 1], job[2])
      end
    end
  end
end

-- Returned as "refused used1 limit1 requested1 usedAfter1 used2 ..." so the
-- caller can log refusals and compute the memory still available
local result = { refused }

for keyIndex = 1, keyCount do
  table.insert(result, used[keyIndex])
  table.insert(result, limits[keyIndex])
  table.insert(result, requested[keyIndex])
  table.insert(result, usedAfter[keyIndex])
end

return table.concat(result, ' ')
`;
