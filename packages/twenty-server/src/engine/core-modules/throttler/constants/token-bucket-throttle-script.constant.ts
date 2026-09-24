import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const TOKEN_BUCKET_THROTTLE_SCRIPT: CacheScript = {
  name: 'throttler:token-bucket-throttle',
  source: `
local key = KEYS[1]
local tokensToConsume = tonumber(ARGV[1])
local maxTokens = tonumber(ARGV[2])
local timeWindow = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])

local refillRate = maxTokens / timeWindow
local raw = redis.call('GET', key)
local tokens = maxTokens
local lastRefillAt = now

if raw then
  local success, data = pcall(cjson.decode, raw)
  if success and data then
    if data.tokens ~= nil then
      tokens = tonumber(data.tokens)
    end
    if data.lastRefillAt ~= nil then
      lastRefillAt = tonumber(data.lastRefillAt)
    end
  end
end

local refillAmount = math.floor(math.max(0, now - lastRefillAt) * refillRate)
local availableTokens = math.min(tokens + refillAmount, maxTokens)

if availableTokens < tokensToConsume then
  return -1
end

local remainingTokens = availableTokens - tokensToConsume
local payload = cjson.encode({ tokens = remainingTokens, lastRefillAt = now })
redis.call('SET', key, payload, 'PX', ttl)

return remainingTokens
`,
};
