import { isString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { v5 } from 'uuid';

export type SortableField = {
  id: string;
  name: string;
  type: FieldMetadataType;
  relationTargetLabelFieldName?: string;
};

export type InexactlyConvertedSort = {
  stepId: string;
  orderByEntry: unknown;
};

type ConvertedRecordSort = {
  id: string;
  fieldMetadataId: string;
  direction: 'ASC' | 'DESC';
  subFieldName?: string;
};

const RECORD_SORT_ID_NAMESPACE = '2f1c6f0e-9a57-4d3b-8a51-7b8e2c4d1a57';

const SUB_FIELD_SORTED_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
]);

const SORTED_SUB_FIELD_BY_COMPOSITE_FIELD_TYPE: Partial<
  Record<FieldMetadataType, string>
> = {
  [FieldMetadataType.CURRENCY]: 'amountMicros',
  [FieldMetadataType.ACTOR]: 'name',
  [FieldMetadataType.LINKS]: 'primaryLinkUrl',
  [FieldMetadataType.EMAILS]: 'primaryEmail',
  [FieldMetadataType.PHONES]: 'primaryPhoneNumber',
};

const RELATION_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
]);

const findLeafDirection = (value: unknown): string | undefined => {
  if (isString(value)) {
    return value;
  }

  return isPlainObject(value)
    ? findLeafDirection(Object.values(value)[0])
    : undefined;
};

const findSortedField = ({
  fieldName,
  fields,
}: {
  fieldName: string;
  fields: SortableField[];
}): SortableField | undefined =>
  fields.find((field) => field.name === fieldName) ??
  fields.find(
    (field) =>
      RELATION_FIELD_TYPES.has(field.type) && `${field.name}Id` === fieldName,
  );

// A record sort orders a relation by its target's label and a composite field by one fixed sub-field
const isOrderedAsRecordSort = ({
  field,
  value,
}: {
  field: SortableField;
  value: unknown;
}): boolean => {
  const sortedSubFieldName = isPlainObject(value)
    ? Object.keys(value)[0]
    : undefined;

  if (RELATION_FIELD_TYPES.has(field.type)) {
    return (
      isString(value) ||
      sortedSubFieldName === field.relationTargetLabelFieldName
    );
  }

  if (SUB_FIELD_SORTED_FIELD_TYPES.has(field.type)) {
    return isDefined(sortedSubFieldName);
  }

  const compositeSortedSubFieldName =
    SORTED_SUB_FIELD_BY_COMPOSITE_FIELD_TYPE[field.type];

  return isDefined(compositeSortedSubFieldName)
    ? sortedSubFieldName === compositeSortedSubFieldName
    : isString(value);
};

// Collapses the builder's position tiebreaker and multi-entry FULL_NAME and relation sorts into one sort per field
const toRecordSorts = ({
  stepId,
  gqlOperationOrderBy,
  fields,
}: {
  stepId: string;
  gqlOperationOrderBy: unknown;
  fields: SortableField[];
}) => {
  const recordSorts: ConvertedRecordSort[] = [];
  const inexactlyConvertedSorts: InexactlyConvertedSort[] = [];

  for (const orderByEntry of Array.isArray(gqlOperationOrderBy)
    ? gqlOperationOrderBy
    : []) {
    const entries = isPlainObject(orderByEntry)
      ? Object.entries(orderByEntry)
      : [];
    const [fieldName, value] = entries[0] ?? [];

    if (entries.length === 1 && fieldName === 'position') {
      continue;
    }

    const direction = findLeafDirection(value);
    const field =
      entries.length === 1 && isString(fieldName)
        ? findSortedField({ fieldName, fields })
        : undefined;

    if (
      !isDefined(field) ||
      !isDefined(direction) ||
      !/^(Asc|Desc)Nulls(First|Last)$/.test(direction)
    ) {
      inexactlyConvertedSorts.push({ stepId, orderByEntry });
      continue;
    }

    // a record sort orders nulls last, and orders a relation by its target's label rather than its id
    if (
      direction.endsWith('NullsFirst') ||
      field.name !== fieldName ||
      !isOrderedAsRecordSort({ field, value })
    ) {
      inexactlyConvertedSorts.push({ stepId, orderByEntry });
    }

    const recordSortDirection = direction.startsWith('Desc') ? 'DESC' : 'ASC';
    const previousRecordSort = recordSorts[recordSorts.length - 1];

    if (previousRecordSort?.fieldMetadataId === field.id) {
      // one record sort orders every entry it spreads over in its own direction
      if (previousRecordSort.direction !== recordSortDirection) {
        inexactlyConvertedSorts.push({ stepId, orderByEntry });
      }

      continue;
    }

    const subFieldName =
      SUB_FIELD_SORTED_FIELD_TYPES.has(field.type) && isPlainObject(value)
        ? Object.keys(value)[0]
        : undefined;

    recordSorts.push({
      // deterministic so the core and workspace copies of a version stay identical
      id: v5(`${stepId}:${recordSorts.length}`, RECORD_SORT_ID_NAMESPACE),
      fieldMetadataId: field.id,
      direction: recordSortDirection,
      ...(isDefined(subFieldName) ? { subFieldName } : {}),
    });
  }

  return { recordSorts, inexactlyConvertedSorts };
};

export const moveFindRecordsSortsToRecordSorts = ({
  steps,
  fieldsByObjectName,
}: {
  steps: unknown;
  fieldsByObjectName: Map<string, SortableField[]>;
}): {
  steps: unknown;
  hasChanged: boolean;
  inexactlyConvertedSorts: InexactlyConvertedSort[];
} => {
  if (!Array.isArray(steps)) {
    return { steps, hasChanged: false, inexactlyConvertedSorts: [] };
  }

  let hasChanged = false;
  const inexactlyConvertedSorts: InexactlyConvertedSort[] = [];

  const convertedSteps = steps.map((step: unknown) => {
    if (
      !isPlainObject(step) ||
      step.type !== 'FIND_RECORDS' ||
      !isPlainObject(step.settings) ||
      !isPlainObject(step.settings.input) ||
      !isPlainObject(step.settings.input.orderBy)
    ) {
      return step;
    }

    const { input } = step.settings;
    const stepId = String(step.id);
    const { gqlOperationOrderBy, ...orderBy } = step.settings.input.orderBy;
    const hasGqlOperationOrderBy =
      'gqlOperationOrderBy' in step.settings.input.orderBy;
    const hasSortsWithoutId =
      Array.isArray(orderBy.recordSorts) &&
      orderBy.recordSorts.some(
        (recordSort) => isPlainObject(recordSort) && !isString(recordSort.id),
      );

    if (!hasGqlOperationOrderBy && !hasSortsWithoutId) {
      return step;
    }

    hasChanged = true;

    if (hasGqlOperationOrderBy && !isDefined(orderBy.recordSorts)) {
      const converted = toRecordSorts({
        stepId,
        gqlOperationOrderBy,
        fields: isString(input.objectName)
          ? (fieldsByObjectName.get(input.objectName) ?? [])
          : [],
      });

      inexactlyConvertedSorts.push(...converted.inexactlyConvertedSorts);

      if (converted.recordSorts.length > 0) {
        orderBy.recordSorts = converted.recordSorts;
      }
    }

    // sorts written through the API or a manifest had no id, which the sort schema now requires
    if (Array.isArray(orderBy.recordSorts)) {
      orderBy.recordSorts = orderBy.recordSorts.map((recordSort, index) =>
        isPlainObject(recordSort) && !isString(recordSort.id)
          ? {
              ...recordSort,
              id: v5(`${stepId}:${index}`, RECORD_SORT_ID_NAMESPACE),
            }
          : recordSort,
      );
    }

    return {
      ...step,
      settings: { ...step.settings, input: { ...input, orderBy } },
    };
  });

  return { steps: convertedSteps, hasChanged, inexactlyConvertedSorts };
};
