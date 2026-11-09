// Job group lanes split their workspace's share by weight without growing it:
// a lane advances by jobCount * activeShare / (laneWeight * platformWeight),
// where activeShare sums the weights of the workspace's backlogged lanes.
export const FAIR_TAG_SCRIPT = `
local virtualTimeKey = KEYS[1]
local baseKey = KEYS[2]
local weightsKey = KEYS[3]
local firstClockKeyIndex = 4
local clockTtlMs = ARGV[1]
local distinctKeyCount = tonumber(ARGV[2])
local firstLanesKeyIndex = firstClockKeyIndex + distinctKeyCount
local firstGroupKeyArgIndex = 3
local requestCount = tonumber(ARGV[firstGroupKeyArgIndex + distinctKeyCount])
local firstRequestArgIndex = firstGroupKeyArgIndex + distinctKeyCount + 1

local virtualTime = tonumber(redis.call('GET', virtualTimeKey) or '0')
local base = tonumber(redis.call('GET', baseKey) or '0')
local clocks = {}
local weights = {}
local lanes = {}

local function readClock(raw)
  if type(raw) ~= 'string' then
    return nil
  end

  local clockBase, clock = string.match(raw, '^([^:]+):(.+)$')

  if clockBase ~= nil then
    return tonumber(clock) - (base - tonumber(clockBase))
  end

  return tonumber(raw)
end

local function formatClock(clock)
  return string.format('%d', base) .. ':' .. clock
end

for i = 1, distinctKeyCount do
  local shiftedClock = readClock(redis.call('GET', KEYS[firstClockKeyIndex + i - 1]))

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

local function loadLanes(keyIndex)
  local lane = lanes[keyIndex]

  if lane ~= nil then
    return lane
  end

  lane = { clocks = {}, weights = {}, touched = {} }

  local fields = redis.call('HGETALL', KEYS[firstLanesKeyIndex + keyIndex - 1])

  for i = 1, #fields, 2 do
    local kind = string.sub(fields[i], 1, 2)
    local name = string.sub(fields[i], 3)

    if kind == 'c:' then
      lane.clocks[name] = readClock(fields[i + 1])
    elseif kind == 'w:' then
      lane.weights[name] = tonumber(fields[i + 1])
    end
  end

  lanes[keyIndex] = lane

  return lane
end

local function otherActiveShare(keyIndex, lane, excludedName, includesDefaultLane)
  local share = 0

  if includesDefaultLane and clocks[keyIndex] > virtualTime then
    share = 1
  end

  for name, clock in pairs(lane.clocks) do
    local weight = lane.weights[name]

    if name ~= excludedName and clock ~= nil and clock > virtualTime and weight ~= nil and weight > 0 then
      share = share + weight
    end
  end

  return share
end

local tickets = { string.format('%d', base) }
local ticketCount = 1
local position = firstRequestArgIndex

for _ = 1, requestCount do
  local jobCount = tonumber(ARGV[position])
  local keyCount = tonumber(ARGV[position + 1])
  local workspaceKeyIndex = tonumber(ARGV[position + 2 + keyCount])
  local laneName = ARGV[position + 3 + keyCount]
  local laneWeight = tonumber(ARGV[position + 4 + keyCount])
  local hasLane = workspaceKeyIndex > 0 and laneName ~= '' and laneWeight ~= nil and laneWeight > 0
  local tag = virtualTime
  local platformWeight = 1

  for k = 1, keyCount do
    local index = tonumber(ARGV[position + 1 + k])

    if not (hasLane and index == workspaceKeyIndex) and clocks[index] > tag then
      tag = clocks[index]
    end

    platformWeight = platformWeight * weights[index]
  end

  local ownShare = 1
  local share = 1

  if workspaceKeyIndex > 0 then
    local lane = loadLanes(workspaceKeyIndex)

    if hasLane then
      local laneClock = lane.clocks[laneName]

      if laneClock == nil or laneClock < virtualTime then
        laneClock = virtualTime
      end

      if laneClock > tag then
        tag = laneClock
      end

      ownShare = laneWeight
      share = otherActiveShare(workspaceKeyIndex, lane, laneName, true) + laneWeight
      lane.clocks[laneName] = laneClock + jobCount * share / (laneWeight * platformWeight)
      lane.weights[laneName] = laneWeight
      lane.touched[laneName] = true
    else
      share = otherActiveShare(workspaceKeyIndex, lane, nil, false) + 1
    end
  end

  local weight = platformWeight * ownShare / share

  for k = 1, keyCount do
    local index = tonumber(ARGV[position + 1 + k])

    if index ~= workspaceKeyIndex then
      clocks[index] = clocks[index] + jobCount / platformWeight
    elseif not hasLane then
      clocks[index] = clocks[index] + jobCount / weight
    end
  end

  tickets[ticketCount + 1] = tostring(tag)
  tickets[ticketCount + 2] = tostring(weight)
  ticketCount = ticketCount + 2
  position = position + 5 + keyCount
end

for i = 1, distinctKeyCount do
  redis.call('SET', KEYS[firstClockKeyIndex + i - 1], formatClock(clocks[i]), 'PX', clockTtlMs)
end

for keyIndex, lane in pairs(lanes) do
  local lanesKey = KEYS[firstLanesKeyIndex + keyIndex - 1]
  local hasLiveLane = false

  for name, clock in pairs(lane.clocks) do
    if lane.touched[name] then
      redis.call('HSET', lanesKey, 'c:' .. name, formatClock(clock), 'w:' .. name, tostring(lane.weights[name]))
      hasLiveLane = true
    elseif clock == nil or clock <= virtualTime then
      redis.call('HDEL', lanesKey, 'c:' .. name, 'w:' .. name)
    else
      hasLiveLane = true
    end
  end

  if hasLiveLane then
    redis.call('PEXPIRE', lanesKey, clockTtlMs)
  end
end

return table.concat(tickets, ' ')
`;
