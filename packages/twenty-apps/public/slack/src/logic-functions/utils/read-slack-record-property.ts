export const readSlackRecordProperty = (
  value: unknown,
  propertyName: string,
): unknown =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)[propertyName]
    : undefined;
