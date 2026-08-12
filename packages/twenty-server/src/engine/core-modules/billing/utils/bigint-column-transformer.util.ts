/* @license Enterprise */

export const bigintColumnTransformer = {
  to: (value: number) => value,
  from: (value: string | number | null) =>
    typeof value === 'string' ? Number(value) : (value ?? 0),
};
