export function objectRecordDiffMerge(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldRecord: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newRecord: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = { diff: {} };
  const skippedKeys: Set<string> = new Set();

  // Normalize values to sort the keys and compare meaningfully
  // This function replaces null, empty strings, empty arrays, and empty objects with placeholders
  // to ensure that they are treated as equal when they are effectively the same.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalize = (val: any): any => {
    if (val === null || val === '') return '__empty__';
    if (Array.isArray(val) && val.length === 0) return '__empty__';
    if (
      typeof val === 'object' &&
      val !== null &&
      Object.keys(val).length === 0
    )
      return '__empty__';

    // recursively normalize nested objects
    if (typeof val === 'object' && val !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized: Record<string, any> = {};

      // sort keys to ensure consistent order for comparison
      const sortedKeys = Object.keys(val).sort();

      for (const key of sortedKeys) {
        normalized[key] = normalize(val[key]);
      }

      return normalized;
    }

    return val;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isEffectivelyEqual = (a: any, b: any): boolean => {
    const normalizedA = JSON.stringify(normalize(a));
    const normalizedB = JSON.stringify(normalize(b));

    return normalizedA === normalizedB;
  };

  // Merge the diff properties from oldRecord and newRecord
  Object.keys(oldRecord.diff ?? {}).forEach((key) => {
    const oldDiff = oldRecord.diff[key];
    const newDiff = newRecord.diff?.[key];

    // If the key exists in both old and new records, we should merge them
    // Merge Logic: If both before and after values are effectively equal, we skip adding this key to the result.
    // If they are not equal, we create a new merged object with before from oldDiff and after from newDiff.
    // If newDiff is undefined, we keep the oldDiff as is.
    if (newDiff) {
      const merged = {
        before: oldDiff.before,
        after: newDiff.after,
      };

      if (isEffectivelyEqual(merged.before, merged.after)) {
        // skip this key if before and after are effectively equal
        skippedKeys.add(key);

        return;
      }

      result.diff[key] = merged;
    } else {
      result.diff[key] = oldDiff;
    }
  });

  // Add keys that were only in newRecord - these are new changes that were not in oldRecord
  Object.keys(newRecord.diff ?? {}).forEach((key) => {
    if (!result.diff[key] && !skippedKeys.has(key)) {
      // If the key is not already in result.diff and was not skipped, we add it
      result.diff[key] = newRecord.diff[key];
    }
  });

  return result;
}
