// a rate limited delivery re-enqueues a fresh job, and the queue's retryLimit
// only bounds attempts within one job, so the chain needs its own cap
export const SLACK_MESSAGE_DELIVERY_MAX_ATTEMPTS = 5;
