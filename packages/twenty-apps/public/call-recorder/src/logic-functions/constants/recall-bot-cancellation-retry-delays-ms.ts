// Escalating re-enqueue delays after the in-job platform retries (seconds-scale)
// are exhausted; the last delay repeats until the attempt cap so the ladder
// outlives provider incidents, not network blips.
export const RECALL_BOT_CANCELLATION_RETRY_DELAYS_MS = [
  60_000, 300_000, 1_800_000, 7_200_000, 36_000_000,
] as const;
