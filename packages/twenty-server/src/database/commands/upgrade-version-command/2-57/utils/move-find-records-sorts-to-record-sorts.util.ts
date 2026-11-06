import { isString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { v5 } from 'uuid';

export type SortableField = {
  id: string;
  name: string;
  type: FieldMetadataType;
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

const findSortedField = (
  fieldName: string,
  fields: SortableField[],
): SortableField | undefined =>
  fields.find((field) => field.name === fieldName) ??
  fields.find(
    (field) =>
      RELATION_FIELD_TYPES.has(field.type) && `${field.name}Id` === fieldName,
  );

// Builder orders end with the position tiebreaker and spread FULL_NAME and relation
// sorts over several entries, so these collapse back to one record sort per field
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
        ? findSortedField(fieldName, fields)
        : undefined;

    if (
      !isDefined(field) ||
      !isDefined(direction) ||
      !/^(Asc|Desc)Nulls(First|Last)$/.test(direction)
    ) {
      inexactlyConvertedSorts.push({ stepId, orderByEntry });
      continue;
    }

    if (direction.endsWith('NullsFirst')) {
      inexactlyConvertedSorts.push({ stepId, orderByEntry });
    }

    if (recordSorts[recordSorts.length - 1]?.fieldMetadataId === field.id) {
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
      direction: direction.startsWith('Desc') ? 'DESC' : 'ASC',
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
      !isPlainObject(step.settings.input.orderBy) ||
      !('gqlOperationOrderBy' in step.settings.input.orderBy)
    ) {
      return step;
    }

    hasChanged = true;

    const { input } = step.settings;
    const { gqlOperationOrderBy, ...orderBy } = step.settings.input.orderBy;

    if (!isDefined(orderBy.recordSorts)) {
      const converted = toRecordSorts({
        stepId: String(step.id),
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

    return {
      ...step,
      settings: { ...step.settings, input: { ...input, orderBy } },
    };
  });

  return { steps: convertedSteps, hasChanged, inexactlyConvertedSorts };
};
