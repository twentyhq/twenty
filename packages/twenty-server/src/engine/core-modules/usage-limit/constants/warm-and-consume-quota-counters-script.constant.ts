import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const WARM_AND_CONSUME_QUOTA_COUNTERS_SCRIPT: CacheScript = {
  name: 'usage-limit:warm-and-consume-quota-counters',
  source: `
local amounts = cjson.decode(ARGV[1])
local warmValues = cjson.decode(ARGV[2])
local warmTtls = cjson.decode(ARGV[3])
local result = {}

for i = 1, #KEYS do
  if warmValues[i] then
    redis.call('SET', KEYS[i], warmValues[i], 'NX', 'PX', warmTtls[i])
  end

  if redis.call('EXISTS', KEYS[i]) == 1 then
    local value = redis.call('INCRBY', KEYS[i], amounts[i])

    if value < 0 then
      redis.call('SET', KEYS[i], 0, 'KEEPTTL')
      value = 0
    end

    result[i] = value
  else
    result[i] = false
  end
end

return result
`,
};
