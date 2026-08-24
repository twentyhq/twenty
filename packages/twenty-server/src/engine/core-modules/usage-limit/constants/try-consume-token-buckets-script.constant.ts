import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const TRY_CONSUME_TOKEN_BUCKETS_SCRIPT: CacheScript = {
  name: 'usage-limit:try-consume-token-buckets',
  source: `
local cost = tonumber(ARGV[1])
local buckets = cjson.decode(ARGV[2])

if #buckets ~= #KEYS then
  return redis.error_reply(
    'try-consume-token-buckets: ' .. #KEYS .. ' keys but ' .. #buckets .. ' bucket configs'
  )
end

local now = redis.call('TIME')
local nowMs = tonumber(now[1]) * 1000 + math.floor(tonumber(now[2]) / 1000)
local available = {}

for i = 1, #KEYS do
  local bucket = buckets[i]
  local state = redis.call('HMGET', KEYS[i], 't', 'ts')
  local tokens = tonumber(state[1])
  local lastRefillAt = tonumber(state[2])

  if tokens == nil or lastRefillAt == nil then
    tokens = bucket.burst
    lastRefillAt = nowMs
  end

  local elapsed = nowMs - lastRefillAt
  if elapsed < 0 then elapsed = 0 end

  local refilled = tokens + (elapsed * bucket.refill / bucket.windowMs)
  if refilled > bucket.burst then refilled = bucket.burst end
  available[i] = refilled

  if refilled < cost then
    return {
      0,
      i,
      math.ceil((cost - refilled) * bucket.windowMs / bucket.refill),
    }
  end
end

for i = 1, #KEYS do
  redis.call('HSET', KEYS[i], 't', tostring(available[i] - cost), 'ts', tostring(nowMs))
  redis.call('PEXPIRE', KEYS[i], buckets[i].windowMs * 2)
end

local result = { 1, 0, 0 }
for i = 1, #KEYS do
  result[#result + 1] = math.floor(available[i] - cost)
end

return result
`,
};
