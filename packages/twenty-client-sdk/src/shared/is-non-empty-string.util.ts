export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;
