import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const WARM_AND_CONSUME_USER_ALLOWANCE_FIRST_SCRIPT: CacheScript = {
  name: 'usage-limit:warm-and-consume-user-allowance-first',
  source: `
local args = cjson.decode(ARGV[1])
local warmValues = cjson.decode(ARGV[2])
local warmTtls = cjson.decode(ARGV[3])
local userAllowanceCount = #args.userAllowanceLimits
local hasWorkspaceAllowance = #KEYS > userAllowanceCount

for i = 1, #KEYS do
  if warmValues[i] then
    redis.call('SET', KEYS[i], warmValues[i], 'NX', 'PX', warmTtls[i])
  end
end

local consumedValues = {}
local isCold = false
for i = 1, #KEYS do
  local value = redis.call('GET', KEYS[i])
  if value then
    consumedValues[i] = tonumber(value)
  else
    consumedValues[i] = false
    isCold = true
  end
end

local function reply(userShare)
  local result = { userShare, false }
  if hasWorkspaceAllowance then
    result[2] = consumedValues[#KEYS]
  end
  for i = 1, userAllowanceCount do
    result[i + 2] = consumedValues[i]
  end
  return result
end

if isCold then
  return reply(false)
end

local userShare = args.amount
if args.isFallbackEnabled then
  for i = 1, userAllowanceCount do
    userShare = math.min(userShare, args.userAllowanceLimits[i] - consumedValues[i])
  end
  userShare = math.max(0, userShare)
end

for i = 1, userAllowanceCount do
  consumedValues[i] = redis.call('INCRBY', KEYS[i], userShare)
end
if hasWorkspaceAllowance then
  consumedValues[#KEYS] = redis.call('INCRBY', KEYS[#KEYS], args.amount - userShare)
end

return reply(userShare)
`,
};
