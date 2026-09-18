import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const UPDATE_RECORD_EXPORT_LEASE_SCRIPT: CacheScript = {
  name: 'record-export:update-lease',
  source: `
if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
if tonumber(ARGV[2]) > 0 then
  return redis.call('PEXPIRE', KEYS[1], ARGV[2])
end
return redis.call('DEL', KEYS[1])
`,
};
