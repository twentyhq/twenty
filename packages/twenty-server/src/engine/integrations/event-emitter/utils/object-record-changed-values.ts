import deepEqual from 'deep-equal';

export const objectRecordChangedValues = (
  oldRecord: Record<string, any>,
  newRecord: Record<string, any>,
) => {
  const isObject = (value: any) => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  };

  const changedValues = Object.keys(newRecord).reduce(
    (acc, key) => {
      // Discard if values are objects (e.g. we don't want Company.AccountOwner ; we have AccountOwnerId already)
      if (isObject(oldRecord[key]) || isObject(newRecord[key])) {
        return acc;
      }

      if (!deepEqual(oldRecord[key], newRecord[key]) && key != 'updatedAt') {
        acc[key] = { before: oldRecord[key], after: newRecord[key] };
      }

      return acc;
    },
    {} as Record<string, { before: any; after: any }>,
  );

  return changedValues;
};
