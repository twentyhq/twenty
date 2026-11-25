import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';

// One script, so a worker that dies between the pop and the add loses no ids
export const POP_DIRTY_RECORDS_INTO_PROCESSING_SCRIPT: CacheScript = {
  name: 'pop-dirty-records-into-processing',
  source: `
local recordIds = redis.call('SPOP', KEYS[1], ARGV[1])
if #recordIds > 0 then
  redis.call('SADD', KEYS[2], unpack(recordIds))
end
return recordIds
`,
};
