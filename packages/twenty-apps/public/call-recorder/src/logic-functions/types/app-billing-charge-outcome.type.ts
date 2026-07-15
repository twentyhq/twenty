// 'unknown' covers timeouts, unreachable billing, and server errors: the
// charge may have landed server-side, so callers must treat it as charged,
// never retry it.
export type AppBillingChargeOutcome =
  | 'charged'
  | 'billing-disabled'
  | 'rejected'
  | 'unknown';
