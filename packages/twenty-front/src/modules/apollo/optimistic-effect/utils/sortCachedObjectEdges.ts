import { type Reference, type StoreObject } from '@apollo/client';
import { type ReadFieldFunction } from '@apollo/client/cache/core/types/common';
import { isNonEmptyString } from '@sniptt/guards';

import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';

import {
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { sortAsc, sortDesc, sortNullsFirst, sortNullsLast } from '~/utils/sort';

// Extracts the OrderBy direction from a nested orderBy structure
// Handles up to 3 levels: field, field.subField, or relation.compositeField.subField
const extractOrderByDirection = (value: unknown): OrderBy | null => {
  if (isNonEmptyString(value)) {
    return value as OrderBy;
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value);
    if (entries.length > 0) {
      return extractOrderByDirection(entries[0][1]);
    }
  }
  return null;
};

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

  const orderByDirection =
    extractOrderByDirection(orderBySubFieldValueOrDirection) ||
    extractOrderByDirection(orderByFieldValueOrDirection);

  if (!orderByDirection) {
    return edges;
  }

  const isAsc = orderByDirection.startsWith('Asc');
  const isNullsFirst = orderByDirection.endsWith('NullsFirst');

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
