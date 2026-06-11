export const isNonEmptyString = (
  value: string | null | undefined,
): value is string => typeof value === 'string' && value.trim() !== '';
