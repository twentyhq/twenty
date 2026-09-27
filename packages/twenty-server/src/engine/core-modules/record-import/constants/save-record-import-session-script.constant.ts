import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

// Compare-and-set on the session version, so concurrent tabs, requests and
// the import job never overwrite each other's changes. The edits of the
// session share its lifetime.
export const SAVE_RECORD_IMPORT_SESSION_SCRIPT: CacheScript = {
  name: 'record-import:save-session',
  source: `
local current = redis.call('GET', KEYS[1])
if ARGV[1] == '' then
  if current then return 0 end
else
  if not current then return 0 end
  if tostring(cjson.decode(current).version) ~= ARGV[1] then return 0 end
end
redis.call('SET', KEYS[1], ARGV[2], 'PX', ARGV[3])
redis.call('PEXPIRE', KEYS[2], ARGV[3])
return 1
`,
};
