// BullMQ serves its wait list (priority 0) first and 1 stays free for a strict lane, so fair tickets start at 2
export const FAIR_TICKET_OFFSET = 2;

export const FAIR_CLOCK_TTL_MS = 24 * 60 * 60 * 1000;
