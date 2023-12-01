import { PaginatedRecordTypeEdge } from '@/object-record/types/PaginatedRecordTypeResults';

export const filterUniqueRecordEdgesByCursor = <
  RecordType extends { id: string },
>(
  arrayToFilter: PaginatedRecordTypeEdge<RecordType>[],
) => {
  const seenCursors = new Set();

  return arrayToFilter.filter((item) => {
    const currentCursor = item.cursor;

    return seenCursors.has(currentCursor)
      ? false
      : seenCursors.add(currentCursor);
  });
};
