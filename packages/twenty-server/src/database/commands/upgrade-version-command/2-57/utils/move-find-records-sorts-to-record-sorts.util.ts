import { isString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

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
  fieldMetadataId: string;
  direction: 'ASC' | 'DESC';
  subFieldName?: string;
};

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
}): SortableField | undefined => {
  // a record sort can't order by a morph relation, so its orders are reported instead
  const recordSortableFields = fields.filter(
    (field) => field.type !== FieldMetadataType.MORPH_RELATION,
  );

  return (
    recordSortableFields.find((field) => field.name === fieldName) ??
    recordSortableFields.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        `${field.name}Id` === fieldName,
    )
  );
};

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

  if (field.type === FieldMetadataType.RELATION) {
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

    // the run appends this tiebreaker itself; any other position order is reported below
    if (
      entries.length === 1 &&
      fieldName === 'position' &&
      value === 'AscNullsFirst'
    ) {
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

    const storedOrderBy = step.settings.input.orderBy;
    const hasStoredSortIds =
      Array.isArray(storedOrderBy.recordSorts) &&
      storedOrderBy.recordSorts.some(
        (recordSort) => isPlainObject(recordSort) && 'id' in recordSort,
      );

    if (!('gqlOperationOrderBy' in storedOrderBy) && !hasStoredSortIds) {
      return step;
    }

    hasChanged = true;

    const { input } = step.settings;
    const { gqlOperationOrderBy, ...orderBy } = storedOrderBy;

    // the builder used to store a list key on each sort, which the sort schema no longer has
    if (Array.isArray(orderBy.recordSorts)) {
      orderBy.recordSorts = orderBy.recordSorts.map((recordSort) => {
        if (!isPlainObject(recordSort)) {
          return recordSort;
        }

        const { id: _id, ...recordSortWithoutId } = recordSort;

        return recordSortWithoutId;
      });
    }

    const hasRecordSorts =
      Array.isArray(orderBy.recordSorts) &&
      isNonEmptyArray(orderBy.recordSorts);

    if (!hasRecordSorts) {
      const converted = toRecordSorts({
        stepId: String(step.id),
        gqlOperationOrderBy,
        fields: isString(input.objectName)
          ? (fieldsByObjectName.get(input.objectName) ?? [])
          : [],
      });

      inexactlyConvertedSorts.push(...converted.inexactlyConvertedSorts);

      if (isNonEmptyArray(converted.recordSorts)) {
        orderBy.recordSorts = converted.recordSorts;
      }
    }

    return {
      ...step,
      settings: { ...step.settings, input: { ...input, orderBy } },
    };
  });

  return { steps: convertedSteps, hasChanged, inexactlyConvertedSorts };
};
