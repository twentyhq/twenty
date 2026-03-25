export const mergeCompositeValues = (
  existingValue: Record<string, unknown> | undefined,
  incomingValue: Record<string, unknown>,
): Record<string, unknown> =>
  existingValue !== undefined
    ? { ...existingValue, ...incomingValue }
    : incomingValue;
