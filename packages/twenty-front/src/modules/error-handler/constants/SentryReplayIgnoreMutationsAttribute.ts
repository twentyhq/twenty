// Opt-in attribute for Sentry Session Replay: mutation batches containing a
// mutation that directly targets an element with this attribute are dropped
// before rrweb serializes them (see ignoreMutations in SentryInitEffect).
//
// Sentry matches the mutation target itself (not its ancestors), so the
// attribute must be set on the element whose own children or attributes
// churn, not on a distant ancestor.
export const SENTRY_REPLAY_IGNORE_MUTATIONS_ATTRIBUTE =
  'data-replay-ignore-mutations';
