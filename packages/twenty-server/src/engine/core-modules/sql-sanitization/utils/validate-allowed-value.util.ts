// Runtime validation that a string value is one of the allowed values.
// Use for values that will be interpolated into SQL to ensure they
// match a known-safe set (e.g. enum values, action keywords).
export const validateAllowedValue = (
  value: string,
  allowedValues: readonly string[],
  label: string,
): void => {
  if (!allowedValues.includes(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
};
