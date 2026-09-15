import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const DELETE_RECORD_EXPORT_SCRIPT: CacheScript = {
  name: 'record-export:delete',
  source: `
redis.call('DEL', KEYS[1])
if redis.call('GET', KEYS[2]) == ARGV[1] then redis.call('DEL', KEYS[2]) end
return 1
`,
};
