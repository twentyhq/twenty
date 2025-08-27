import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';

export const filterUniqueRecordEdgesByCursor = (
  arrayToFilter: RecordGqlEdge[],
) => {
  const seenCursors = new Set();

  return arrayToFilter.filter((item) => {
    const currentCursor = item.cursor;

    return seenCursors.has(currentCursor)
      ? false
      : seenCursors.add(currentCursor);
  });
};
