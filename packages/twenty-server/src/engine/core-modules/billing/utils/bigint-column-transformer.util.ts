/* @license Enterprise */

// Postgres returns bigint as a string to avoid a lossy cast to a JS number.
// Shared by the micro-denominated credit columns so the ledger and the mirror
// it sums into cannot coerce differently.
export const bigintColumnTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) =>
    typeof value === 'string' ? Number(value) : (value ?? 0),
};
