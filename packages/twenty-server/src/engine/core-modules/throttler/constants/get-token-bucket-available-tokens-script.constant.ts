import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const GET_TOKEN_BUCKET_AVAILABLE_TOKENS_SCRIPT: CacheScript = {
  name: 'throttler:get-token-bucket-available-tokens',
  source: `
local burst = tonumber(ARGV[1])
local refill = tonumber(ARGV[2])
local windowMs = tonumber(ARGV[3])

local state = redis.call('HMGET', KEYS[1], 't', 'ts')
local tokens = tonumber(state[1])
local lastRefillAt = tonumber(state[2])

if tokens == nil or lastRefillAt == nil then
  return burst
end

local now = redis.call('TIME')
local nowMs = tonumber(now[1]) * 1000 + math.floor(tonumber(now[2]) / 1000)
local elapsed = nowMs - lastRefillAt
if elapsed < 0 then elapsed = 0 end

local available = tokens + (elapsed * refill / windowMs)
if available > burst then available = burst end

return math.floor(available)
`,
};
