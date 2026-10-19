import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const RESERVE_PACED_SLOT_SCRIPT: CacheScript = {
  name: 'throttler:reserve-paced-slot',
  source: `
local intervalMs = tonumber(ARGV[1])

local now = redis.call('TIME')
local nowMs = tonumber(now[1]) * 1000 + math.floor(tonumber(now[2]) / 1000)
local nextSlotAt = tonumber(redis.call('GET', KEYS[1]))

if nextSlotAt == nil or nextSlotAt < nowMs then
  nextSlotAt = nowMs
end

local reservedUntil = nextSlotAt + intervalMs

redis.call('SET', KEYS[1], tostring(reservedUntil), 'PX', reservedUntil - nowMs)

return nextSlotAt - nowMs
`,
};
