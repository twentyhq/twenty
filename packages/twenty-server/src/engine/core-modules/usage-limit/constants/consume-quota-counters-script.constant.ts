import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const CONSUME_QUOTA_COUNTERS_SCRIPT: CacheScript = {
  name: 'usage-limit:consume-quota-counters',
  source: `
local costs = cjson.decode(ARGV[1])
local result = {}

for i = 1, #KEYS do
  if redis.call('EXISTS', KEYS[i]) == 1 then
    result[2 * i - 1] = 1
    result[2 * i] = redis.call('DECRBY', KEYS[i], costs[i])
  else
    result[2 * i - 1] = 0
    result[2 * i] = 0
  end
end

return result
`,
};
