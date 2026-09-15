export const isDefined = <TValue>(
  value: TValue | null | undefined,
): value is NonNullable<TValue> => value !== null && value !== undefined;
