// Retry-After is expressed in whole seconds, and a value of 0 would invite an
// immediate retry that is guaranteed to be denied again.
export const getRetryAfterSeconds = (retryAfterMs: number): number =>
  Math.max(1, Math.ceil(retryAfterMs / 1000));
