export const FAIR_DISPATCH_SCRIPT = `
local ticketOffset = tonumber(ARGV[1])
local priority = tonumber(redis.call('HGET', KEYS[2], 'priority'))

if priority == nil or priority < ticketOffset then
  return 0
end

local ticket = priority - ticketOffset

if ticket > tonumber(redis.call('GET', KEYS[1]) or '0') then
  redis.call('SET', KEYS[1], ticket)
end

return 0
`;
