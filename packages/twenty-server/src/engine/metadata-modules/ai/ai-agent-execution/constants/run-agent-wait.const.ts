// as long as a run may hold its conversation, so a run that waited this long is still going on
export const RUN_AGENT_MAX_WAIT_MS = 15 * 60_000;

export const RUN_AGENT_SETTLED_RUN_TTL_SECONDS = 3_600;

// pub/sub may drop a message, so a waiting call also reads the stored settlement now and then
export const RUN_AGENT_SETTLED_RUN_POLL_INTERVAL_MS = 2_000;
