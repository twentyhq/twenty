import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const CONSUME_TOKEN_BUCKET_SCRIPT: CacheScript = {
  name: 'throttler:consume-token-bucket',
  source: `
local tokensToConsume = tonumber(ARGV[1])
local maxTokens = tonumber(ARGV[2])
local timeWindow = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local allowOverdraft = ARGV[5] == '1'
local serializedState = redis.call('GET', KEYS[1])
local tokens = maxTokens
local lastRefillAt = now

if serializedState then
  local state = cjson.decode(serializedState)
  tokens = tonumber(state.tokens)
  lastRefillAt = tonumber(state.lastRefillAt)
end

local elapsed = math.max(0, now - lastRefillAt)
local refillAmount = math.floor(elapsed * maxTokens / timeWindow)
local availableTokens = math.min(tokens + refillAmount, maxTokens)

if not allowOverdraft and availableTokens < tokensToConsume then
  return { 0, tostring(availableTokens) }
end

local remainingTokens = availableTokens - tokensToConsume

-- Existing buckets must stay readable during rolling deployments.
redis.call('SET', KEYS[1], cjson.encode({
  tokens = remainingTokens,
  lastRefillAt = now
}), 'PX', timeWindow * 2)

return { 1, tostring(remainingTokens) }
`,
};
