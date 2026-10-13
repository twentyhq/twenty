import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const WARM_AND_CONSUME_COUNTERS_SCRIPT: CacheScript = {
  name: 'usage-limit:warm-and-consume-counters',
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
    result[i] = redis.call('INCRBY', KEYS[i], amounts[i])

    if result[i] < 0 then
      redis.call('SET', KEYS[i], 0, 'KEEPTTL')
      result[i] = 0
    end
  else
    result[i] = false
  end
end

return result
`,
};
