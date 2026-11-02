export const FAIR_REBASE_SCRIPT = `
local state = redis.call('HMGET', KEYS[1], 'phase', 'cursor', 'virtualTime')
local phase = state[1]

if not phase then
  return {0, 0}
end

local cursor = tonumber(state[2])
local oldVirtualTime = tonumber(state[3])
local base = tonumber(redis.call('GET', KEYS[5]) or '0')
local step = tonumber(ARGV[1])
local chunkSize = tonumber(ARGV[2])
local prefix = ARGV[3]
local now = tonumber(ARGV[4])
local graceMs = tonumber(ARGV[5])
local ticketOffset = tonumber(ARGV[6])
local scoreBase = 4294967296

local function formatScore(value)
  return string.format('%.0f', value)
end

local function rebaseJob(jobId)
  local jobKey = prefix .. jobId
  local job = redis.call('HMGET', jobKey, 'priority', 'fairBase', 'opts')
  local priority = tonumber(job[1])

  if priority == nil or priority < ticketOffset then
    return 0
  end

  local rawOptions = type(job[3]) == 'string' and job[3] or ''
  local jobBase = tonumber(job[2]) or tonumber(string.match(rawOptions, '"fairBase":(%d+)') or '') or base
  local shift = base - jobBase

  if shift <= 0 then
    return 0
  end

  local ticket = priority - ticketOffset
  local rebasedTicket = math.max(ticket - shift, 0)

  redis.call('HSET', jobKey, 'priority', rebasedTicket + ticketOffset, 'fairBase', base)

  return ticket - rebasedTicket
end

if phase == 'g' then
  if now < cursor then
    return {2, cursor - now}
  end

  redis.call('HSET', KEYS[1], 'phase', 'f', 'cursor', formatScore((oldVirtualTime - step / 2 + ticketOffset) * scoreBase - 1))

  return {1, 0}
end

local processed = 0

if phase == 'p' or phase == 'f' then
  local members = redis.call('ZRANGEBYSCORE', KEYS[2], '(' .. formatScore(cursor), '+inf', 'WITHSCORES', 'LIMIT', 0, chunkSize)

  for i = 1, #members, 2 do
    local score = tonumber(members[i + 1])
    local priorityDrop = rebaseJob(members[i])

    if priorityDrop > 0 then
      redis.call('ZADD', KEYS[2], formatScore(score - priorityDrop * scoreBase), members[i])
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
  local members = redis.call('ZRANGEBYSCORE', KEYS[3], '(' .. formatScore(cursor), '+inf', 'WITHSCORES', 'LIMIT', 0, chunkSize)

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
    cursor = now + graceMs
  else
    redis.call('DEL', KEYS[1])

    return {0, 0}
  end
end

redis.call('HSET', KEYS[1], 'phase', phase, 'cursor', formatScore(cursor))

return {1, 0}
`;
