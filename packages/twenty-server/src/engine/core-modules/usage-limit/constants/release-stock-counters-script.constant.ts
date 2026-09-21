import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const RELEASE_STOCK_COUNTERS_SCRIPT: CacheScript = {
  name: 'usage-limit:release-stock-counters',
  source: `
local amounts = cjson.decode(ARGV[1])
local caps = cjson.decode(ARGV[2])

for i = 1, #KEYS do
  if redis.call('EXISTS', KEYS[i]) == 1 then
    local remaining = redis.call('INCRBY', KEYS[i], amounts[i])

    if remaining > caps[i] then
      redis.call('SET', KEYS[i], caps[i], 'KEEPTTL')
    end
  end
end

return 1
`,
};
