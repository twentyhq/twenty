// BullMQ serves its wait list (priority 0) first, so 1 is the urgent lane and fair tickets start at 2
export const URGENT_FAIR_PRIORITY = 1;
export const FAIR_TICKET_OFFSET = 2;

// Tickets count dispatched jobs: past the threshold, the virtual time, the clocks and the waiting tickets shift down by the step
export const FAIR_REBASE_THRESHOLD = 2 ** 20;
export const FAIR_REBASE_STEP = 2 ** 19;
// During a rebase a ticket above this floor is still on the old scale; new-scale tickets stay below it while the backlog fits under it
export const FAIR_REBASE_OLD_SCALE_FLOOR =
  FAIR_REBASE_THRESHOLD - FAIR_REBASE_STEP / 2;
export const FAIR_REBASE_CHUNK_SIZE = 1000;
// A ticket reserved before a rebase can still be inserted after it, so the last pass waits for in-flight reservations
export const FAIR_REBASE_GRACE_MS = 1000;
export const FAIR_REBASE_MAX_CHUNKS = 100_000;

export const FAIR_CLOCK_TTL_MS = 24 * 60 * 60 * 1000;
