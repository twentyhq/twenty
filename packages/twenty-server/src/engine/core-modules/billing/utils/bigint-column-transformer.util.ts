/* @license Enterprise */

// Postgres returns bigint as a string, so it needs coercing back. Shared by the
// micro-denominated credit columns so the ledger and the mirror it sums into
// cannot coerce differently.
//
// Number() is only lossless below 2^53, which is 9e9 credits at
// INTERNAL_CREDITS_PER_DISPLAY_CREDIT. Balances are bounded well under that by
// BILLING_MAX_ADMIN_CREDIT_GRANT_MICRO and the rollover cap, and
// getActiveCreditsMicro throws rather than serve a total that is not a safe
// integer, so the range is asserted rather than assumed.
export const bigintColumnTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) =>
    typeof value === 'string' ? Number(value) : (value ?? 0),
};
