import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

// Returns the remaining budget per key, or false (a null reply) for keys that
// do not exist. A missing key must never be created as -cost: the counter is
// only trustworthy once the warm path installed the period's budget, and
// DECRBY on an absent key would install -cost as the whole balance.
export const SETTLE_QUOTA_COUNTERS_SCRIPT: CacheScript = {
  name: 'usage-limit:settle-quota-counters',
  source: `
local cost = tonumber(ARGV[1])
local remaining = {}

for i = 1, #KEYS do
  if redis.call('EXISTS', KEYS[i]) == 1 then
    remaining[i] = redis.call('DECRBY', KEYS[i], cost)
  else
    remaining[i] = false
  end
end

return remaining
`,
};
