/* @license Enterprise */

// Two cron periods, so a change missed by one run is caught by the next
export const BILLING_SEAT_ARRANGEMENT_SYNC_LOOKBACK_MS = 2 * 60 * 60 * 1000;
