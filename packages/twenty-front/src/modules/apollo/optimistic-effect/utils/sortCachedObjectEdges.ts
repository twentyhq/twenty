import { type Reference, type StoreObject } from '@apollo/client';
import { type FieldFunctionOptions } from '@apollo/client/cache';

type ReadFieldFunction = FieldFunctionOptions['readField'];
import { isNonEmptyString } from '@sniptt/guards';

import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';

import {
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
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

type ParsedOrderByCriterion = {
  fieldName: string;
  subFieldName?: string;
  subSubFieldName?: string;
  isAsc: boolean;
  isNullsFirst: boolean;
};

const parseOrderByCriterion = (
  orderCriterion: Record<string, unknown>,
): ParsedOrderByCriterion | null => {
  const entries = Object.entries(orderCriterion);
  if (entries.length === 0) {
    return null;
  }

  const [fieldName, fieldValueOrDirection] = entries[0];
  const [subFieldName, subFieldValueOrDirection] =
    isNonEmptyString(fieldValueOrDirection) || !isDefined(fieldValueOrDirection)
      ? []
      : (Object.entries(fieldValueOrDirection as Record<string, unknown>)[0] ??
        []);

  const [subSubFieldName] =
    isNonEmptyString(subFieldValueOrDirection) ||
    !isDefined(subFieldValueOrDirection)
      ? []
      : (Object.entries(
          subFieldValueOrDirection as Record<string, unknown>,
        )[0] ?? []);

  const orderByDirection =
    extractOrderByDirection(subFieldValueOrDirection) ||
    extractOrderByDirection(fieldValueOrDirection);

  if (!orderByDirection) {
    return null;
  }

  const isAsc = orderByDirection.startsWith(doNotTranslate('Asc'));
  const isNullsFirst = orderByDirection.endsWith('NullsFirst');

  return {
    fieldName,
    subFieldName,
    subSubFieldName,
    isAsc,
    isNullsFirst,
  };
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
  if (!Array.isArray(orderBy) || orderBy.length === 0) {
    return edges;
  }

  const parsedCriteria = orderBy
    .map((criterion) =>
      parseOrderByCriterion(criterion as Record<string, unknown>),
    )
    .filter(isDefined);

  if (parsedCriteria.length === 0) {
    return edges;
  }

  const readFieldValueToSort = (
    edge: RecordGqlRefEdge,
    criterion: ParsedOrderByCriterion,
  ): string | number | null => {
    const recordFromCache = edge.node;
    const fieldValue =
      readCacheField<Reference | StoreObject | string | number | null>(
        criterion.fieldName,
        recordFromCache,
      ) ?? null;
    if (!isDefined(criterion.subFieldName) || !isDefined(fieldValue)) {
      return fieldValue as string | number | null;
    }

    const subFieldValue =
      readCacheField<Reference | StoreObject | string | number | null>(
        criterion.subFieldName,
        fieldValue as Reference | StoreObject,
      ) ?? null;

    // Handle 3-level nesting: relation -> composite field -> sub-field
    // e.g., accountOwner (relation) -> name (composite FULL_NAME) -> firstName
    if (isDefined(subFieldValue) && isDefined(criterion.subSubFieldName)) {
      const subSubFieldValue =
        readCacheField<string | number | null>(
          criterion.subSubFieldName,
          // At this level, subFieldValue is the composite object (not a Reference)
          subFieldValue as Reference | StoreObject,
        ) ?? null;
      return subSubFieldValue;
    }

    return subFieldValue as string | number | null;
  };

  return [...edges].sort((edgeA, edgeB) => {
    for (const criterion of parsedCriteria) {
      const fieldValueA = readFieldValueToSort(edgeA, criterion);
      const fieldValueB = readFieldValueToSort(edgeB, criterion);

      if (fieldValueA === null || fieldValueB === null) {
        const nullComparison = criterion.isNullsFirst
          ? sortNullsFirst(fieldValueA, fieldValueB)
          : sortNullsLast(fieldValueA, fieldValueB);

        if (nullComparison !== 0) {
          return nullComparison;
        }
        continue;
      }

      const comparison = criterion.isAsc
        ? sortAsc(fieldValueA, fieldValueB)
        : sortDesc(fieldValueA, fieldValueB);

      if (comparison !== 0) {
        return comparison;
      }
    }

    return 0;
  });
};
