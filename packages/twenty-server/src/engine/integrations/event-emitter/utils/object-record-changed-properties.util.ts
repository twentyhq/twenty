import deepEqual from 'deep-equal';

export const objectRecordChangedProperties = (
  oldRecord: Record<string, any>,
  newRecord: Record<string, any>,
) => {
  const changedProperties = Object.keys(newRecord).filter(
    (key) => !deepEqual(oldRecord[key], newRecord[key]),
  );

  return changedProperties;
};
