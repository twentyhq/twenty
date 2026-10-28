export const FAIR_TAG_SCRIPT = `
local virtualTimeKey = KEYS[1]
local weightsKey = KEYS[2]
local firstClockKeyIndex = 3
local clockTtlMs = ARGV[1]
local distinctKeyCount = tonumber(ARGV[2])
local firstGroupKeyArgIndex = 3
local requestCount = tonumber(ARGV[firstGroupKeyArgIndex + distinctKeyCount])
local firstRequestArgIndex = firstGroupKeyArgIndex + distinctKeyCount + 1

local virtualTime = tonumber(redis.call('GET', virtualTimeKey) or '0')
local clocks = {}
local weights = {}

for i = 1, distinctKeyCount do
  local clock = tonumber(redis.call('GET', KEYS[firstClockKeyIndex + i - 1]))

  clocks[i] = virtualTime

  if clock ~= nil and clock > virtualTime then
    clocks[i] = clock
  end

  local weight = tonumber(redis.call('HGET', weightsKey, ARGV[firstGroupKeyArgIndex + i - 1]))

  if weight == nil or weight <= 0 then
    weight = 1
  end

  weights[i] = weight
end

local tickets = {}
local ticketCount = 0
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
  redis.call('SET', KEYS[firstClockKeyIndex + i - 1], tostring(clocks[i]), 'PX', clockTtlMs)
end

return table.concat(tickets, ' ')
`;
