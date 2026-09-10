// Hard ceiling on how many database events a single logic function trigger job carries when the
// trigger opts into batchMode. It bounds the Redis job payload, so a handler must never assume a
// batch is full: a batch holds anything from one event up to this many.
export const MAX_EVENTS_PER_TRIGGER_JOB = 200;
