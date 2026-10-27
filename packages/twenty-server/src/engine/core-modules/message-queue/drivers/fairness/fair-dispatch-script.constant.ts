// KEYS: virtual time. ARGV: job key, ticket offset. Raises the virtual time to the ticket of the dispatched job, leaving urgent and missing jobs alone
export const FAIR_DISPATCH_SCRIPT = `
local ticketOffset = tonumber(ARGV[2])
local priority = tonumber(redis.call('HGET', ARGV[1], 'priority'))

if priority == nil or priority < ticketOffset then
  return 0
end

local ticket = priority - ticketOffset

if ticket > tonumber(redis.call('GET', KEYS[1]) or '0') then
  redis.call('SET', KEYS[1], ticket)
end

return 0
`;
