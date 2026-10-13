import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const WARM_AND_CONSUME_MEMBER_FIRST_SCRIPT: CacheScript = {
  name: 'usage-limit:warm-and-consume-member-first',
  source: `
-- KEYS[1] member counter; KEYS[2] allowance counter, present only in WORKSPACE_CREDITS mode
local args = cjson.decode(ARGV[1])
local warmValues = cjson.decode(ARGV[2])
local warmTtls = cjson.decode(ARGV[3])

for i = 1, #KEYS do
  if warmValues[i] then
    redis.call('SET', KEYS[i], warmValues[i], 'NX', 'PX', warmTtls[i])
  end
end

local memberValue = redis.call('GET', KEYS[1])
local allowanceValue = false
if #KEYS == 2 then
  allowanceValue = redis.call('GET', KEYS[2])
end

-- never decide a split on a cold counter: apply nothing and report which key is cold
if (not memberValue) or (#KEYS == 2 and not allowanceValue) then
  return {
    memberValue and tonumber(memberValue) or false,
    allowanceValue and tonumber(allowanceValue) or false,
    false,
  }
end

local memberShare = args.amount
if args.isFallbackEnabled then
  memberShare = math.max(0, math.min(args.amount, args.memberLimit - tonumber(memberValue)))
end

local result = { redis.call('INCRBY', KEYS[1], memberShare), false, memberShare }
if #KEYS == 2 then
  result[2] = redis.call('INCRBY', KEYS[2], args.amount - memberShare)
end
return result
`,
};
