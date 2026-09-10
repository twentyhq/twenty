// Hard ceiling on how many events a single trigger job can carry, bounding the Redis payload
// even if LOGIC_FUNCTION_DATABASE_EVENT_MAX_BATCH_SIZE is raised
export const MAX_EVENTS_PER_TRIGGER_JOB = 500;
