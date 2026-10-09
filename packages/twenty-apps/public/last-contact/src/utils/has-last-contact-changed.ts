const TIMESTAMP_FIELD_NAMES = new Set([
  'lastContactAt',
  'lastOutboundAt',
  'lastInboundAt',
]);

const normalizeValue = (fieldName: string, value: unknown): unknown => {
  if (value === undefined || value === null) {
    return null;
  }

  return TIMESTAMP_FIELD_NAMES.has(fieldName) && typeof value === 'string'
    ? Date.parse(value)
    : value;
};

// Every upsert bumps updatedAt, so records whose values already match are left
// out of the write.
export const hasLastContactChanged = (
  current: Record<string, unknown>,
  next: Record<string, string | null>,
): boolean =>
  Object.entries(next).some(
    ([fieldName, value]) =>
      normalizeValue(fieldName, current[fieldName]) !==
      normalizeValue(fieldName, value),
  );
