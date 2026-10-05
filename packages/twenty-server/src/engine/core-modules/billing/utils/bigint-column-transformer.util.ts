/* @license Enterprise */

// Postgres returns bigint as a string; Number() is safe because getActiveCreditsMicro asserts totals stay below 2^53.
export const bigintColumnTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) =>
    typeof value === 'string' ? Number(value) : (value ?? 0),
};
