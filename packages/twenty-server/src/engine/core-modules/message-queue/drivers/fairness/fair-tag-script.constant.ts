// KEYS: virtual time, rebase base, weights hash, one clock per distinct group key. ARGV: clock TTL, key count, the keys, reservation count, then per reservation its batch size, key count and 1-based key indexes. Returns the tag and weight of each reservation, space separated
export const FAIR_TAG_SCRIPT = `
local virtualTime = tonumber(redis.call('GET', KEYS[1]) or '0')
local base = tonumber(redis.call('GET', KEYS[2]) or '0')
local distinctKeyCount = tonumber(ARGV[2])
local clocks = {}
local weights = {}

for i = 1, distinctKeyCount do
  local raw = redis.call('GET', KEYS[3 + i]) or ''
  local clockBase, clock = string.match(raw, '^([^:]+):(.+)$')

  clocks[i] = virtualTime

  if clockBase ~= nil then
    local shiftedClock = tonumber(clock) - (base - tonumber(clockBase))

    if shiftedClock > virtualTime then
      clocks[i] = shiftedClock
    end
  end

  local weight = tonumber(redis.call('HGET', KEYS[3], ARGV[2 + i]))

  if weight == nil or weight <= 0 then
    weight = 1
  end

  weights[i] = weight
end

local tickets = {}
local ticketCount = 0
local position = 4 + distinctKeyCount

for _ = 1, tonumber(ARGV[3 + distinctKeyCount]) do
  local batchSize = tonumber(ARGV[position])
  local keyCount = tonumber(ARGV[position + 1])
  local tag = virtualTime
  local weight = 1

  for k = 1, keyCount do
    local index = tonumber(ARGV[position + 1 + k])

    if clocks[index] > tag then
      tag = clocks[index]
    end

    weight = weight * weights[index]
  end

  for k = 1, keyCount do
    local index = tonumber(ARGV[position + 1 + k])

    clocks[index] = clocks[index] + batchSize / weight
  end

  tickets[ticketCount + 1] = tostring(tag)
  tickets[ticketCount + 2] = tostring(weight)
  ticketCount = ticketCount + 2
  position = position + 2 + keyCount
end

for i = 1, distinctKeyCount do
  redis.call('SET', KEYS[3 + i], string.format('%d', base) .. ':' .. clocks[i], 'PX', ARGV[1])
end

return table.concat(tickets, ' ')
`;
