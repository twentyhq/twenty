// Each poll spends one application API call per 200 batch jobs, against a
// budget shared by every workspace on the instance, so the panel polls at a
// human pace and stops as soon as the run settles.
export const BACKFILL_STATUS_POLL_INTERVAL_MS = 3_000;
