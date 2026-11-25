import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';

export const filterUniqueRecordEdgesByCursor = (
  arrayToFilter: RecordGqlEdge[],
) => {
  const seenCursors = new Set();

  return arrayToFilter.filter((item) => {
    const currentCursor = item.cursor;

    if (seenCursors.has(currentCursor)) {
      return false;
    }

    seenCursors.add(currentCursor);

    return true;
  });
};
