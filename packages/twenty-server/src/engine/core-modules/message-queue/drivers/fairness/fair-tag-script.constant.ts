export const FAIR_TAG_SCRIPT = `
local virtualTimeKey = KEYS[1]
local baseKey = KEYS[2]
local weightsKey = KEYS[3]
local firstClockKeyIndex = 4
local clockTtlMs = ARGV[1]
local distinctKeyCount = tonumber(ARGV[2])
local firstGroupKeyArgIndex = 3
local requestCount = tonumber(ARGV[firstGroupKeyArgIndex + distinctKeyCount])
local firstRequestArgIndex = firstGroupKeyArgIndex + distinctKeyCount + 1

local virtualTime = tonumber(redis.call('GET', virtualTimeKey) or '0')
local base = tonumber(redis.call('GET', baseKey) or '0')
local clocks = {}
local weights = {}

for i = 1, distinctKeyCount do
  local raw = redis.call('GET', KEYS[firstClockKeyIndex + i - 1]) or ''
  local clockBase, clock = string.match(raw, '^([^:]+):(.+)$')
  local shiftedClock = tonumber(raw)

  if clockBase ~= nil then
    shiftedClock = tonumber(clock) - (base - tonumber(clockBase))
  end

  clocks[i] = virtualTime

  if shiftedClock ~= nil and shiftedClock > virtualTime then
    clocks[i] = shiftedClock
  end

  local weight = tonumber(redis.call('HGET', weightsKey, ARGV[firstGroupKeyArgIndex + i - 1]))

  if weight == nil or weight <= 0 then
    weight = 1
  end

  weights[i] = weight
end

local tickets = { string.format('%d', base) }
local ticketCount = 1
local position = firstRequestArgIndex

for _ = 1, requestCount do
  local jobCount = tonumber(ARGV[position])
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

    clocks[index] = clocks[index] + jobCount / weight
  end

  tickets[ticketCount + 1] = tostring(tag)
  tickets[ticketCount + 2] = tostring(weight)
  ticketCount = ticketCount + 2
  position = position + 2 + keyCount
end

for i = 1, distinctKeyCount do
  redis.call('SET', KEYS[firstClockKeyIndex + i - 1], string.format('%d', base) .. ':' .. clocks[i], 'PX', clockTtlMs)
end

return table.concat(tickets, ' ')
`;
