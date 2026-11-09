import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

// Slots carry their own expiry as score, so a pod that dies mid-request cannot hold a slot forever.
export const ACQUIRE_HTTP_EGRESS_CONCURRENCY_SLOT_SCRIPT: CacheScript = {
  name: 'http-egress:acquire-concurrency-slot',
  source: `
local now = redis.call('TIME')
local nowMs = tonumber(now[1]) * 1000 + math.floor(tonumber(now[2]) / 1000)
local slotId = ARGV[1]
local maxSlots = tonumber(ARGV[2])
local slotTtlMs = tonumber(ARGV[3])

redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', nowMs)

if redis.call('ZCARD', KEYS[1]) >= maxSlots then
  return 0
end

redis.call('ZADD', KEYS[1], nowMs + slotTtlMs, slotId)
redis.call('PEXPIRE', KEYS[1], slotTtlMs)

return 1
`,
};
