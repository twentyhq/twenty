export function objectRecordDiffMerge(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldRecord: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newRecord: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = { diff: {} };

  // Iterate over the keys in the oldRecord diff
  Object.keys(oldRecord.diff ?? {}).forEach((key) => {
    if (newRecord.diff && newRecord.diff[key]) {
      // If the key also exists in the newRecord, merge the 'before' from the oldRecord and the 'after' from the newRecord
      result.diff[key] = {
        before: oldRecord.diff[key].before,
        after: newRecord.diff[key].after,
      };
    } else {
      // If the key does not exist in the newRecord, copy it as is from the oldRecord
      result.diff[key] = oldRecord.diff[key];
    }
  });

  // Iterate over the keys in the newRecord diff to catch any that weren't in the oldRecord
  Object.keys(newRecord.diff ?? {}).forEach((key) => {
    if (!result.diff[key]) {
      // If the key was not already added from the oldRecord, add it from the newRecord
      result.diff[key] = newRecord.diff[key];
    }
  });

  return result;
}
