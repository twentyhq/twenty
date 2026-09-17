import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const CREATE_RECORD_EXPORT_DOWNLOAD_SCRIPT: CacheScript = {
  name: 'record-export:create-download',
  source: `
if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[2], ARGV[2], 'PX', ARGV[3])
return 1
`,
};
