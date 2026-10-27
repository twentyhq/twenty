// KEYS: virtual time, rebase base, rebase state, BullMQ prioritized key. ARGV: job key, rebase threshold, rebase step, ticket offset, old-scale floor. Returns 0, 1 when this dispatch started a rebase, 2 while one is in progress
export const FAIR_DISPATCH_SCRIPT = `
local virtualTime = tonumber(redis.call('GET', KEYS[1]) or '0')
local threshold = tonumber(ARGV[2])
local step = tonumber(ARGV[3])
local ticketOffset = tonumber(ARGV[4])
local oldScaleFloor = tonumber(ARGV[5])
local isRebasing = redis.call('EXISTS', KEYS[3]) == 1
local priority = tonumber(redis.call('HGET', ARGV[1], 'priority'))

if priority == nil or priority < ticketOffset then
  return isRebasing and 2 or 0
end

local ticket = priority - ticketOffset

if (isRebasing and ticket >= oldScaleFloor) or ticket - virtualTime >= step then
  ticket = ticket - step
  redis.call('HSET', ARGV[1], 'priority', ticket + ticketOffset)
end

if ticket > virtualTime then
  virtualTime = ticket
end

if isRebasing or virtualTime < threshold or redis.call('ZCARD', KEYS[4]) >= oldScaleFloor - (virtualTime - step) then
  redis.call('SET', KEYS[1], virtualTime)

  return isRebasing and 2 or 0
end

redis.call('SET', KEYS[1], virtualTime - step)
redis.call('INCRBY', KEYS[2], step)
redis.call('SET', KEYS[3], 'p:' .. string.format('%.0f', (oldScaleFloor + ticketOffset) * 4294967296 - 1))

return 1
`;
