import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

export const TOUCH_RECORD_IMPORT_SESSION_SCRIPT: CacheScript = {
  name: 'record-import:touch-session',
  source: `return redis.call('PEXPIRE', KEYS[1], ARGV[1])`,
};
