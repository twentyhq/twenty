// Recursively strips null, undefined, empty strings, empty objects,
// and empty arrays from a value. Returns undefined if the entire
// value is empty so the caller can decide whether to include it.
export const stripEmptyValues = (value: unknown): unknown => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    const cleaned = value
      .map(stripEmptyValues)
      .filter((item) => item !== undefined);

    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const stripped = stripEmptyValues(val);

      if (stripped !== undefined) {
        result[key] = stripped;
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  return value;
};
