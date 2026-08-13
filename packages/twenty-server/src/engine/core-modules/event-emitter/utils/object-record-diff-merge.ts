export function objectRecordDiffMerge(
  // oxlint-disable-next-line typescript/no-explicit-any
  oldRecord: Record<string, any>,
  // oxlint-disable-next-line typescript/no-explicit-any
  newRecord: Record<string, any>,
  // oxlint-disable-next-line typescript/no-explicit-any
): Record<string, any> {
  // oxlint-disable-next-line typescript/no-explicit-any
  const result: Record<string, any> = { diff: {} };

  Object.keys(oldRecord.diff ?? {}).forEach((key) => {
    if (newRecord.diff && newRecord.diff[key]) {
      result.diff[key] = {
        before: oldRecord.diff[key].before,
        after: newRecord.diff[key].after,
      };
    } else {
      result.diff[key] = oldRecord.diff[key];
    }
  });

  Object.keys(newRecord.diff ?? {}).forEach((key) => {
    if (!result.diff[key]) {
      result.diff[key] = newRecord.diff[key];
    }
  });

  return result;
}
