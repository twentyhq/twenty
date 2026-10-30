// Longer than any bounded provider call, so a live worker never loses its
// claim mid-send.
export const SETU_AI_ACTION_LEASE_DURATION_MS = 2 * 60 * 1000;
