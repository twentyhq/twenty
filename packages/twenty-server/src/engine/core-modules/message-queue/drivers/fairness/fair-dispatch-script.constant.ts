export const FAIR_DISPATCH_SCRIPT = `
local virtualTime = tonumber(redis.call('GET', KEYS[1]) or '0')
local base = tonumber(redis.call('GET', KEYS[2]) or '0')
local isRebasing = redis.call('EXISTS', KEYS[3]) == 1
local threshold = tonumber(ARGV[1])
local step = tonumber(ARGV[2])
local ticketOffset = tonumber(ARGV[3])
local job = redis.call('HMGET', KEYS[4], 'priority', 'fairBase', 'opts')
local priority = tonumber(job[1])

if priority == nil or priority < ticketOffset then
  return isRebasing and 2 or 0
end

local rawOptions = type(job[3]) == 'string' and job[3] or ''
local jobBase = tonumber(job[2]) or tonumber(string.match(rawOptions, '"fairBase":(%d+)') or '') or base
local shift = base - jobBase
local ticket = priority - ticketOffset

if shift > 0 then
  ticket = math.max(ticket - shift, 0)
  redis.call('HSET', KEYS[4], 'priority', ticket + ticketOffset, 'fairBase', base)
end

if ticket > virtualTime then
  virtualTime = ticket
end

if isRebasing or virtualTime < threshold then
  redis.call('SET', KEYS[1], virtualTime)

  return isRebasing and 2 or 0
end

redis.call('SET', KEYS[1], virtualTime - step)
redis.call('INCRBY', KEYS[2], step)
redis.call('HSET', KEYS[3], 'phase', 'p', 'cursor', '0', 'virtualTime', virtualTime)

return 1
`;
