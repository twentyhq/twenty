export const JOBS_PERSISTED_OPTIONS_SCRIPT = `
-- Reads, for each BullMQ job key, the options and timestamp stored when the job was created.
--
-- KEYS: the BullMQ job keys to read
-- Returns "opts1\\ntimestamp1\\nopts2\\ntimestamp2...", empty lines for a missing job.
-- Encoded options never hold a raw newline, so it is a safe separator.

local values = {}

for index = 1, #KEYS do
  local job = redis.call('HMGET', KEYS[index], 'opts', 'timestamp')

  values[index * 2 - 1] = type(job[1]) == 'string' and job[1] or ''
  values[index * 2] = type(job[2]) == 'string' and job[2] or ''
end

return table.concat(values, '\\n')
`;
