export function objectRecordDiffMerge(
  oldRecord: Record<string, unknown>,
  newRecord: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { diff: {} };

  const oldDiff = (oldRecord.diff as Record<string, unknown>) ?? {};
  const newDiff = (newRecord.diff as Record<string, unknown>) ?? {};
  const resultDiff = result.diff as Record<string, unknown>;

  // Iterate over the keys in the oldRecord diff
  Object.keys(oldDiff).forEach((key) => {
    if (newDiff[key]) {
      // If the key also exists in the newRecord, merge the 'before' from the oldRecord and the 'after' from the newRecord
      const oldValue = oldDiff[key] as Record<string, unknown>;
      const newValue = newDiff[key] as Record<string, unknown>;

      resultDiff[key] = {
        before: oldValue.before,
        after: newValue.after,
      };
    } else {
      // If the key does not exist in the newRecord, copy it as is from the oldRecord
      resultDiff[key] = oldDiff[key];
    }
  });

  // Iterate over the keys in the newRecord diff to catch any that weren't in the oldRecord
  Object.keys(newDiff).forEach((key) => {
    if (!resultDiff[key]) {
      // If the key was not already added from the oldRecord, add it from the newRecord
      resultDiff[key] = newDiff[key];
    }
  });

  return result;
}
