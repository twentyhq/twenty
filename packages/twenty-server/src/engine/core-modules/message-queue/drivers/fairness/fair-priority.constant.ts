// BullMQ serves its wait list (priority 0) first, so 1 is the urgent lane and fair tickets start at 2
export const URGENT_FAIR_PRIORITY = 1;
export const FAIR_TICKET_OFFSET = 2;

export const FAIR_CLOCK_TTL_MS = 24 * 60 * 60 * 1000;
