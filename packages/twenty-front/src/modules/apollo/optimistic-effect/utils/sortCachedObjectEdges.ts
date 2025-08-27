import { type Reference, type StoreObject } from '@apollo/client';
import { type ReadFieldFunction } from '@apollo/client/cache/core/types/common';

import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { type OrderBy } from '@/types/OrderBy';
import { sortAsc, sortDesc, sortNullsFirst, sortNullsLast } from '~/utils/sort';
import { isDefined } from 'twenty-shared/utils';

export const sortCachedObjectEdges = ({
  edges,
  orderBy,
  readCacheField,
}: {
  edges: RecordGqlRefEdge[];
  orderBy: RecordGqlOperationOrderBy;
  readCacheField: ReadFieldFunction;
}) => {
  const [orderByFieldName, orderByFieldValue] = Object.entries(orderBy[0])[0];
  const [orderBySubFieldName, orderBySubFieldValue] =
    typeof orderByFieldValue === 'string'
      ? []
      : Object.entries(orderByFieldValue)[0];

  const readFieldValueToSort = (
    edge: RecordGqlRefEdge,
  ): string | number | null => {
    const recordFromCache = edge.node;
    const fieldValue =
      readCacheField<Reference | StoreObject | string | number | null>(
        orderByFieldName,
        recordFromCache,
      ) ?? null;
    const isSubFieldFilter = isDefined(fieldValue) && !!orderBySubFieldName;

    if (!isSubFieldFilter) return fieldValue as string | number | null;

    const subFieldValue =
      readCacheField<string | number | null>(
        orderBySubFieldName,
        fieldValue as Reference | StoreObject,
      ) ?? null;

    return subFieldValue;
  };

  const orderByValue = orderBySubFieldValue || (orderByFieldValue as OrderBy);

  const isAsc = orderByValue.startsWith('Asc');
  const isNullsFirst = orderByValue.endsWith('NullsFirst');

  return [...edges].sort((edgeA, edgeB) => {
    const fieldValueA = readFieldValueToSort(edgeA);
    const fieldValueB = readFieldValueToSort(edgeB);

    if (fieldValueA === null || fieldValueB === null) {
      return isNullsFirst
        ? sortNullsFirst(fieldValueA, fieldValueB)
        : sortNullsLast(fieldValueA, fieldValueB);
    }

    return isAsc
      ? sortAsc(fieldValueA, fieldValueB)
      : sortDesc(fieldValueA, fieldValueB);
  });
};
