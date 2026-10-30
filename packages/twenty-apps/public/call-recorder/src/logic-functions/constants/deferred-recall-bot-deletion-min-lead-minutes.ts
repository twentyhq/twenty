// Keeps a deferred deletion clear of Recall's 10-minute cutoff for bot changes and
// ahead of the pre-join credit check, which retries a deletion that failed.
export const DEFERRED_RECALL_BOT_DELETION_MIN_LEAD_MINUTES = 20;
