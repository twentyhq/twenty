// This is needed because workflows/tools may pass partial composite fields
// with undefined sub-properties, but the validation layer expects either
// a value or null (not undefined)
export const removeUndefinedFromRecord = <T extends Record<string, unknown>>(
  record: T,
): T => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      const cleaned = removeUndefinedFromRecord(
        value as Record<string, unknown>,
      );

      if (Object.keys(cleaned).length > 0) {
        result[key] = cleaned;
      }
    } else {
      result[key] = value;
    }
  }

  return result as T;
};
