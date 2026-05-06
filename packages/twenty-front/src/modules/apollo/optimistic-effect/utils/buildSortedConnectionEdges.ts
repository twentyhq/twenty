import { type FieldFunctionOptions } from '@apollo/client/cache';

import { sortCachedObjectEdges } from '@/apollo/optimistic-effect/utils/sortCachedObjectEdges';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

type NewEntry = {
  edge: RecordGqlRefEdge;
  record: RecordGqlNode;
};

type BuildSortedConnectionEdgesArgs = {
  currentEdges: readonly RecordGqlRefEdge[];
  newEntries: readonly NewEntry[];
  orderBy: RecordGqlOperationOrderBy | undefined;
  readField: FieldFunctionOptions['readField'];
};

export const buildSortedConnectionEdges = ({
  currentEdges,
  newEntries,
  orderBy,
  readField,
}: BuildSortedConnectionEdgesArgs): RecordGqlRefEdge[] => {
  const firstEdges: RecordGqlRefEdge[] = [];
  const lastEdges: RecordGqlRefEdge[] = [];
  const sortableEdges: RecordGqlRefEdge[] = [];

  for (const { edge, record } of newEntries) {
    if (record.position === 'first') {
      firstEdges.push(edge);
    } else if (record.position === 'last') {
      lastEdges.push(edge);
    } else {
      sortableEdges.push(edge);
    }
  }

  let middleEdges: RecordGqlRefEdge[];

  if (Array.isArray(orderBy) && orderBy.length > 0) {
    middleEdges = sortCachedObjectEdges({
      edges: [...currentEdges, ...sortableEdges],
      orderBy,
      readCacheField: readField,
    });
  } else {
    middleEdges = [...sortableEdges, ...currentEdges];
  }

  return [...firstEdges, ...middleEdges, ...lastEdges];
};
