export const isArray = (
  value: unknown,
): value is unknown[] | readonly unknown[] => Array.isArray(value);
