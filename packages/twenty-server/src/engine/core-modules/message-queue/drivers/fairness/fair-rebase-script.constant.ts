// KEYS: rebase state, BullMQ prioritized, delayed and active keys. ARGV: rebase step, old-scale priority floor, chunk size, job key prefix, now, grace ms. Rewrites one chunk of old-scale tickets; returns {1, 0} to continue, {2, wait ms} during the grace period, {0, 0} once done
export const FAIR_REBASE_SCRIPT = `
local state = redis.call('GET', KEYS[1])

if not state then
  return {0, 0}
end

local step = tonumber(ARGV[1])
local oldScaleFloor = tonumber(ARGV[2])
local chunkSize = tonumber(ARGV[3])
local prefix = ARGV[4]
local now = tonumber(ARGV[5])
local phase, cursor = string.match(state, '^(%a):(.+)$')

cursor = tonumber(cursor)

local function formatCursor(value)
  return string.format('%.0f', value)
end

local function rebaseJob(jobId)
  local jobKey = prefix .. jobId
  local priority = tonumber(redis.call('HGET', jobKey, 'priority'))

  if priority == nil or priority < oldScaleFloor then
    return false
  end

  redis.call('HSET', jobKey, 'priority', priority - step)

  return true
end

if phase == 'g' then
  if now < cursor then
    return {2, cursor - now}
  end

  redis.call('SET', KEYS[1], 'f:' .. formatCursor(oldScaleFloor * 4294967296 - 1))

  return {1, 0}
end

local processed = 0

if phase == 'p' or phase == 'f' then
  local members = redis.call('ZRANGEBYSCORE', KEYS[2], '(' .. formatCursor(cursor), '+inf', 'WITHSCORES', 'LIMIT', 0, chunkSize)

  for i = 1, #members, 2 do
    local score = tonumber(members[i + 1])

    if rebaseJob(members[i]) then
      redis.call('ZADD', KEYS[2], score - step * 4294967296, members[i])
    end

    cursor = score
  end

  processed = #members / 2
elseif phase == 'a' then
  local jobIds = redis.call('LRANGE', KEYS[4], cursor, cursor + chunkSize - 1)

  for _, jobId in ipairs(jobIds) do
    rebaseJob(jobId)
  end

  cursor = cursor + #jobIds
  processed = #jobIds
elseif phase == 'd' then
  local members = redis.call('ZRANGEBYSCORE', KEYS[3], '(' .. formatCursor(cursor), '+inf', 'WITHSCORES', 'LIMIT', 0, chunkSize)

  for i = 1, #members, 2 do
    rebaseJob(members[i])
    cursor = tonumber(members[i + 1])
  end

  processed = #members / 2
end

if processed < chunkSize then
  if phase == 'p' then
    phase = 'a'
    cursor = 0
  elseif phase == 'a' then
    phase = 'd'
    cursor = 0
  elseif phase == 'd' then
    phase = 'g'
    cursor = now + tonumber(ARGV[6])
  else
    redis.call('DEL', KEYS[1])

    return {0, 0}
  end
end

redis.call('SET', KEYS[1], phase .. ':' .. formatCursor(cursor))

return {1, 0}
`;
