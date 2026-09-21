// Queue redeliveries all land within seconds; a later attempt is what gives Recall time to recover before the join.
export const PRE_JOIN_CREDIT_CHECK_RETRY_DELAY_MS = 60_000;
