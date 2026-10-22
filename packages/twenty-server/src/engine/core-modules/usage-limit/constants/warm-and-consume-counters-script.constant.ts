import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const WARM_AND_CONSUME_COUNTERS_SCRIPT: CacheScript = {
  name: 'usage-limit:warm-and-consume-counters',
  source: `
local amounts = cjson.decode(ARGV[1])
local warmValues = cjson.decode(ARGV[2])
local warmTtls = cjson.decode(ARGV[3])
local splits = cjson.decode(ARGV[4] or '[]')
local userLimits = cjson.decode(ARGV[5] or '[]')
local isUserCreditsFallbackEnabled = ARGV[6] == 'true'
local result = {}
local isSplitCold = false
local userShare = false

for i = 1, #KEYS do
  if warmValues[i] then
    redis.call('SET', KEYS[i], warmValues[i], 'NX', 'PX', warmTtls[i])
  end

  if splits[i] then
    local consumed = redis.call('GET', KEYS[i])

    if not consumed then
      isSplitCold = true
    elseif splits[i] == 'userCredits' then
      local share = amounts[i]

      if isUserCreditsFallbackEnabled then
        share = math.max(0, math.min(share, userLimits[i] - tonumber(consumed)))
      end

      userShare = math.min(userShare or share, share)
    end
  end
end

if isSplitCold then
  userShare = false
end

for i = 1, #KEYS do
  local amount = amounts[i]

  if splits[i] == 'userCredits' then
    amount = userShare
  elseif splits[i] == 'workspaceCredits' then
    amount = math.max(0, amounts[i] - (userShare or 0))
  end

  if not (splits[i] and isSplitCold) and redis.call('EXISTS', KEYS[i]) == 1 then
    result[i] = redis.call('INCRBY', KEYS[i], amount)

    if result[i] < 0 then
      redis.call('SET', KEYS[i], 0, 'KEEPTTL')
      result[i] = 0
    end
  else
    result[i] = false
  end
end

if userShare then
  result[#KEYS + 1] = userShare
end

return result
`,
};
