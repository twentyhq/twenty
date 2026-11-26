export const JOBS_PERSISTED_OPTIONS_SCRIPT = `
local values = {}

for index = 1, #KEYS do
  local job = redis.call('HMGET', KEYS[index], 'opts', 'timestamp')

  values[index * 2 - 1] = type(job[1]) == 'string' and job[1] or ''
  values[index * 2] = type(job[2]) == 'string' and job[2] or ''
end

return table.concat(values, '\\n')
`;
