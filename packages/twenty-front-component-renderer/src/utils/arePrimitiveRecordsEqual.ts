type PrimitiveRecord = Record<string, string | number | boolean | null>;

export const arePrimitiveRecordsEqual = <TRecord extends PrimitiveRecord>(
  firstRecord: TRecord,
  secondRecord: TRecord,
): boolean => {
  for (const key in firstRecord) {
    if (firstRecord[key] !== secondRecord[key]) {
      return false;
    }
  }

  return true;
};
