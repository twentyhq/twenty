// A single run now folds a whole batch of records instead of one, so the handler
// needs far more headroom than it did per event.
export const BATCH_HANDLER_TIMEOUT_SECONDS = 300;
