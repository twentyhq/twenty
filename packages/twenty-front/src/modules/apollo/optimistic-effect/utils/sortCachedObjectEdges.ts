import { type Reference, type StoreObject } from '@apollo/client';
import { type FieldFunctionOptions } from '@apollo/client/cache';

type ReadFieldFunction = FieldFunctionOptions['readField'];
import { isNonEmptyString } from '@sniptt/guards';

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
  const [orderByFieldName, orderByFieldValueOrDirection] = Object.entries(
    orderBy[0],
  )[0];
  const [orderBySubFieldName, orderBySubFieldValueOrDirection] =
    isNonEmptyString(orderByFieldValueOrDirection)
      ? []
      : Object.entries(orderByFieldValueOrDirection)[0];

  // For relation fields with composite nested fields (e.g., accountOwner.name.firstName)
  const [orderBySubSubFieldNameOrDirection] =
    isNonEmptyString(orderBySubFieldValueOrDirection) ||
    !isDefined(orderBySubFieldValueOrDirection)
      ? []
      : Object.entries(orderBySubFieldValueOrDirection)[0];

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
      readCacheField<Reference | StoreObject | string | number | null>(
        orderBySubFieldName,
        fieldValue as Reference | StoreObject,
      ) ?? null;

    // Handle 3-level nesting: relation -> composite field -> sub-field
    // e.g., accountOwner (relation) -> name (composite FULL_NAME) -> firstName
    if (
      isDefined(subFieldValue) &&
      isDefined(orderBySubSubFieldNameOrDirection)
    ) {
      const subSubFieldValue =
        readCacheField<string | number | null>(
          orderBySubSubFieldNameOrDirection,
          // At this level, subFieldValue is the composite object (not a Reference)
          subFieldValue as Reference | StoreObject,
        ) ?? null;
      return subSubFieldValue;
    }

    return subFieldValue as string | number | null;
  };

  const orderByDirection = getOrderByPathAndDirection(orderBy)?.direction;

  if (!isDefined(orderByDirection)) {
    return edges;
  }

  return [...edges].sort((edgeA, edgeB) =>
    compareSortableValues(
      readFieldValueToSort(edgeA),
      readFieldValueToSort(edgeB),
      orderByDirection,
    ),
  );
};
