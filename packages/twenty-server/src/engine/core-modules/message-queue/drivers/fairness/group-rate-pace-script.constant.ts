export const GROUP_RATE_PACE_SCRIPT = `
local time = redis.call('TIME')
local nowMs = tonumber(time[1]) * 1000.0 + math.floor(tonumber(time[2]) / 1000)
local distinctKeyCount = tonumber(ARGV[1])
local slots = {}
local intervals = {}
local tolerances = {}

for i = 1, distinctKeyCount do
  intervals[i] = tonumber(ARGV[2 * i])
  tolerances[i] = tonumber(ARGV[2 * i + 1])

  local slot = tonumber(redis.call('GET', KEYS[i]) or '0') or 0

  if slot < nowMs then
    slot = nowMs
  end

  slots[i] = slot
end

local requestCount = tonumber(ARGV[2 * distinctKeyCount + 2])
local position = 2 * distinctKeyCount + 3
local earliestDueTimes = { string.format('%.0f', nowMs) }
local earliestDueTimeCount = 1

for _ = 1, requestCount do
  local jobCount = tonumber(ARGV[position])
  local keyCount = tonumber(ARGV[position + 1])

  for k = 1, keyCount do
    local index = tonumber(ARGV[position + 1 + k])

    earliestDueTimeCount = earliestDueTimeCount + 1
    earliestDueTimes[earliestDueTimeCount] = string.format('%.0f', math.floor(slots[index] - tolerances[index]))
    slots[index] = slots[index] + jobCount * intervals[index]
  end

  position = position + 2 + keyCount
end

for i = 1, distinctKeyCount do
  redis.call('SET', KEYS[i], string.format('%.3f', slots[i]), 'PX', math.max(1, math.ceil(slots[i] - nowMs)))
end

return table.concat(earliestDueTimes, ' ')
`;
