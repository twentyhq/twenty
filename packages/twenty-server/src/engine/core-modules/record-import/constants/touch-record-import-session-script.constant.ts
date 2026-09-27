import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const TOUCH_RECORD_IMPORT_SESSION_SCRIPT: CacheScript = {
  name: 'record-import:touch-session',
  source: `
redis.call('PEXPIRE', KEYS[2], ARGV[1])
return redis.call('PEXPIRE', KEYS[1], ARGV[1])
`,
};
