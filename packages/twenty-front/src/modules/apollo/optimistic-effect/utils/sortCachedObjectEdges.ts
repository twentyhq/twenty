import { Reference, StoreObject } from '@apollo/client';
import { ReadFieldFunction } from '@apollo/client/cache/core/types/common';

import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { isDefined } from '~/utils/isDefined';
import { sortAsc, sortDesc, sortNullsFirst, sortNullsLast } from '~/utils/sort';

export const sortCachedObjectEdges = ({
  edges,
  orderBy,
  readCacheField,
}: {
  edges: CachedObjectRecordEdge[];
  orderBy: OrderByField;
  readCacheField: ReadFieldFunction;
}) => {
  const [orderByFieldName, orderByFieldValue] = Object.entries(orderBy)[0];
  const [orderBySubFieldName, orderBySubFieldValue] =
    typeof orderByFieldValue === 'string'
      ? []
      : Object.entries(orderByFieldValue)[0];

  const readFieldValueToSort = (
    edge: CachedObjectRecordEdge,
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
