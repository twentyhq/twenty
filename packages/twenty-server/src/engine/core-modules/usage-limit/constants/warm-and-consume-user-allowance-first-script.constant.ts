import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const WARM_AND_CONSUME_USER_ALLOWANCE_FIRST_SCRIPT: CacheScript = {
  name: 'usage-limit:warm-and-consume-user-allowance-first',
  source: `
-- KEYS[1] user allowance counter; KEYS[2] allowance counter, present only in WORKSPACE_CREDITS mode
local args = cjson.decode(ARGV[1])
local warmValues = cjson.decode(ARGV[2])
local warmTtls = cjson.decode(ARGV[3])

for i = 1, #KEYS do
  if warmValues[i] then
    redis.call('SET', KEYS[i], warmValues[i], 'NX', 'PX', warmTtls[i])
  end
end

local userAllowanceValue = redis.call('GET', KEYS[1])
local workspaceAllowanceValue = false
if #KEYS == 2 then
  workspaceAllowanceValue = redis.call('GET', KEYS[2])
end

-- never decide a split on a cold counter: apply nothing and report which key is cold
if (not userAllowanceValue) or (#KEYS == 2 and not workspaceAllowanceValue) then
  return {
    userAllowanceValue and tonumber(userAllowanceValue) or false,
    workspaceAllowanceValue and tonumber(workspaceAllowanceValue) or false,
    false,
  }
end

local userShare = args.amount
if args.isFallbackEnabled then
  userShare = math.max(0, math.min(args.amount, args.userAllowanceLimit - tonumber(userAllowanceValue)))
end

local result = { redis.call('INCRBY', KEYS[1], userShare), false, userShare }
if #KEYS == 2 then
  result[2] = redis.call('INCRBY', KEYS[2], args.amount - userShare)
end
return result
`,
};
