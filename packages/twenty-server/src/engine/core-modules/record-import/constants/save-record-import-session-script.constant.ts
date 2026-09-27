import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

// Compare-and-set on the session version, so concurrent tabs, requests and
// the import job never overwrite each other's changes. The edits of the
// session share its lifetime, and are dropped in the same step when the
// change makes them meaningless.
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
if ARGV[4] == '1' then
  redis.call('DEL', KEYS[2])
else
  redis.call('PEXPIRE', KEYS[2], ARGV[3])
end
return 1
`,
};
