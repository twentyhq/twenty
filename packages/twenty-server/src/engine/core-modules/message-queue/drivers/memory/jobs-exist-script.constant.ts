export const JOBS_EXIST_SCRIPT = `
-- Tells, for each BullMQ job key, whether BullMQ still holds that job (waiting, active,
-- or kept after finishing). Re-enqueuing such an id starts no new run, so it is not charged.
--
-- KEYS: the BullMQ job keys to check
-- Returns "1 0 1 ...", one flag per key in KEYS order

local flags = {}

for index = 1, #KEYS do
  flags[index] = redis.call('EXISTS', KEYS[index])
end

return table.concat(flags, ' ')
`;
