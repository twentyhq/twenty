export const isDefined = <T>(
  value: T | undefined | null,
): value is NonNullable<T> => value !== undefined && value !== null;
