// Flat charge per invocation: $0.0001 (1 micro credit = $0.000001).
export const LOGIC_FUNCTION_INVOCATION_CREDITS_MICRO = 100;

// Duration is billed like AWS Lambda, which prices $0.0000166667 per GB-second
// on top of the per-request charge. Executor lambdas run at 512MB, so the raw
// AWS duration cost is ~8.3 micro credits per second; rounded up to 10 micro
// credits per second (0.01 per ms) to cover infrastructure overhead.
export const LOGIC_FUNCTION_DURATION_CREDITS_MICRO_PER_MS = 0.01;
