import { type Reference, type StoreObject } from '@apollo/client';
import { type FieldFunctionOptions } from '@apollo/client/cache';

type ReadFieldFunction = FieldFunctionOptions['readField'];

import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { compareSortableValues } from '@/object-record/utils/compareSortableValues';
import { getOrderByPathAndDirection } from '@/object-record/utils/getOrderByPathAndDirection';

import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';
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
  const pathAndDirection = getOrderByPathAndDirection(orderBy);

  if (!isDefined(pathAndDirection)) {
    return edges;
  }

  const { path, direction } = pathAndDirection;

  const readFieldValueToSort = (
    edge: RecordGqlRefEdge,
  ): string | number | null => {
    let value: Reference | StoreObject | string | number | null = edge.node;

    for (const fieldName of path) {
      if (!isDefined(value) || typeof value !== 'object') {
        return null;
      }

      value =
        readCacheField<Reference | StoreObject | string | number | null>(
          fieldName,
          value,
        ) ?? null;
    }

    return typeof value === 'object' ? null : value;
  };

  return [...edges].sort((edgeA, edgeB) =>
    compareSortableValues({
      valueA: readFieldValueToSort(edgeA),
      valueB: readFieldValueToSort(edgeB),
      direction,
    }),
  );
};
