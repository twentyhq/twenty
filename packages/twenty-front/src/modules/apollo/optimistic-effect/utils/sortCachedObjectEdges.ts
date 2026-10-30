import { type Reference, type StoreObject } from '@apollo/client';
import { type FieldFunctionOptions } from '@apollo/client/cache';
import { isNonEmptyString } from '@sniptt/guards';

import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { sortAsc, sortDesc, sortNullsFirst, sortNullsLast } from '~/utils/sort';

type SortCriterion = {
  fieldPath: string[];
  direction: OrderBy;
};

const extractSortCriteria = (
  orderBy: RecordGqlOperationOrderBy[number],
  parentPath: string[] = [],
): SortCriterion[] =>
  Object.entries(orderBy).flatMap(([fieldName, value]) => {
    const fieldPath = [...parentPath, fieldName];

    return isNonEmptyString(value)
      ? [{ fieldPath, direction: value }]
      : extractSortCriteria(value, fieldPath);
  });

export const sortCachedObjectEdges = ({
  edges,
  orderBy,
  readCacheField,
}: {
  edges: RecordGqlRefEdge[];
  orderBy: RecordGqlOperationOrderBy;
  readCacheField: FieldFunctionOptions['readField'];
}) => {
  const sortCriteria = orderBy.flatMap((criterion) =>
    extractSortCriteria(criterion),
  );

  if (sortCriteria.length === 0) {
    return edges;
  }

  const readFieldValueToSort = (
    edge: RecordGqlRefEdge,
    fieldPath: string[],
  ): string | number | null => {
    let value: Reference | StoreObject | string | number | null = edge.node;

    for (const fieldName of fieldPath) {
      if (!isDefined(value)) {
        return null;
      }

      value =
        readCacheField<Reference | StoreObject | string | number | null>(
          fieldName,
          value as Reference | StoreObject,
        ) ?? null;
    }

    return value as string | number | null;
  };

  return [...edges].sort((edgeA, edgeB) => {
    for (const { fieldPath, direction } of sortCriteria) {
      const fieldValueA = readFieldValueToSort(edgeA, fieldPath);
      const fieldValueB = readFieldValueToSort(edgeB, fieldPath);
      const isAsc = direction.startsWith(doNotTranslate('Asc'));
      const isNullsFirst = direction.endsWith('NullsFirst');
      const comparison =
        fieldValueA === null || fieldValueB === null
          ? isNullsFirst
            ? sortNullsFirst(fieldValueA, fieldValueB)
            : sortNullsLast(fieldValueA, fieldValueB)
          : isAsc
            ? sortAsc(fieldValueA, fieldValueB)
            : sortDesc(fieldValueA, fieldValueB);

      if (comparison !== 0) {
        return comparison;
      }
    }

    return 0;
  });
};
