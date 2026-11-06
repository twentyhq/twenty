export const JOBS_EXIST_SCRIPT = `
local flags = {}

for index = 1, #KEYS do
  flags[index] = redis.call('EXISTS', KEYS[index])
end

return table.concat(flags, ' ')
`;
