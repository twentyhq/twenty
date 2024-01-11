import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export const filterUniqueRecordEdgesByCursor = <
  RecordType extends { id: string },
>(
  arrayToFilter: ObjectRecordEdge<RecordType>[],
) => {
  const seenCursors = new Set();

  return arrayToFilter.filter((item) => {
    const currentCursor = item.cursor;

    return seenCursors.has(currentCursor)
      ? false
      : seenCursors.add(currentCursor);
  });
};
