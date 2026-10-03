import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

// Extends the key's TTL, or deletes it when the TTL is 0, only while it still
// holds the caller's value, so a caller whose lease expired cannot touch a key
// that someone else now owns
export const UPDATE_OWNED_KEY_LEASE_SCRIPT: CacheScript = {
  name: 'update-owned-key-lease',
  source: `
if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
if tonumber(ARGV[2]) > 0 then
  return redis.call('PEXPIRE', KEYS[1], ARGV[2])
end
return redis.call('DEL', KEYS[1])
`,
};
