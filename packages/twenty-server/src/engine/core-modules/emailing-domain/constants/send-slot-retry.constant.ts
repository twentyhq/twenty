export const SEND_SLOT_RETRY = {
  attemptLimit: 60,
  jitterRatio: 0.5,
  maxWindows: 3,
  minDelayMs: 1_000,
  maxDelayMs: 60_000,
};
