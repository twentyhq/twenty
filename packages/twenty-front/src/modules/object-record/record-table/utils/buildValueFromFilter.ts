import { Temporal } from 'temporal-polyfill';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';

import {
  type RecordFilter,
  type RecordFilterToRecordInputOperand,
} from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES } from 'twenty-shared/constants';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
  ViewFilterOperand,
  type FieldMetadataOptions,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  FILTER_OPERANDS_MAP,
  parseJson,
} from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';

type FilterOption = {
  label: string;
  position: number;
  value: string;
};

type CompositeValue = Record<string, unknown>;

type ValueComputeContext = {
  value: string;
  operand: ViewFilterOperand;
  options?: FilterOption[] | null;
  relationType?: RelationType;
  currentWorkspaceMember?: CurrentWorkspaceMember;
  currentRecordId?: string;
  label?: string;
  timeZone?: string;
};

type ValueHandler = (context: ValueComputeContext) => unknown;

type CompositeFilterContext = {
  filter: RecordFilter;
  relationType?: RelationType;
  currentWorkspaceMember?: CurrentWorkspaceMember;
  label?: string;
};

const getCompositeSubFieldProperty = ({
  compositeFieldType,
  subFieldName,
}: {
  compositeFieldType: FieldMetadataType;
  subFieldName: string;
}) => {
  const compositeType = compositeTypeDefinitions.get(compositeFieldType);
  if (!compositeType) {
    return;
  }

  return compositeType.properties.find(
    (property) => property.name === subFieldName,
  );
};

type ContainsBasedOperand =
  | ViewFilterOperand.CONTAINS
  | ViewFilterOperand.DOES_NOT_CONTAIN
  | ViewFilterOperand.IS_EMPTY
  | ViewFilterOperand.IS_NOT_EMPTY;

const computeValueFromContainsOperand = (
  operand: ContainsBasedOperand,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.CONTAINS:
    case ViewFilterOperand.IS_NOT_EMPTY:
      return value;
    case ViewFilterOperand.DOES_NOT_CONTAIN:
    case ViewFilterOperand.IS_EMPTY:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const filterDateTimeToInstant = (
  value: string,
  timeZone: string,
): Temporal.Instant =>
  value.includes('T')
    ? Temporal.Instant.from(value)
    : Temporal.PlainDate.from(value).toZonedDateTime(timeZone).toInstant();

const computeValueFromFilterDate = (
  operand: RecordFilterToRecordInputOperand<'DATE_TIME'>,
  value: string,
  isDateOnly: boolean,
  timeZone = 'UTC',
): string | undefined => {
  switch (operand) {
    case ViewFilterOperand.IS:
    case ViewFilterOperand.IS_AFTER:
      return isDateOnly
        ? Temporal.PlainDate.from(value).toString()
        : filterDateTimeToInstant(value, timeZone).toString();
    case ViewFilterOperand.IS_BEFORE:
      return isDateOnly
        ? Temporal.PlainDate.from(value).subtract({ days: 1 }).toString()
        : filterDateTimeToInstant(value, timeZone)
            .subtract({ minutes: 1 })
            .toString();
    case ViewFilterOperand.IS_TODAY:
    case ViewFilterOperand.IS_NOT_EMPTY:
    case ViewFilterOperand.IS_IN_PAST:
    case ViewFilterOperand.IS_IN_FUTURE:
    case ViewFilterOperand.IS_RELATIVE:
      return isDateOnly
        ? Temporal.Now.plainDateISO(timeZone).toString()
        : Temporal.Now.instant().toString();
    case ViewFilterOperand.IS_EMPTY:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterNumber = (
  operand: RecordFilterToRecordInputOperand<'NUMBER'>,
  value: string,
) => {
  switch (operand) {
    // TODO: we shouln't create values from those filters as it makes no sense for the user
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL:
      return Number(value) + 1;
    case ViewFilterOperand.LESS_THAN_OR_EQUAL:
      return Number(value) - 1;
    case ViewFilterOperand.IS_NOT_EMPTY:
    case ViewFilterOperand.IS:
      return Number(value);
    case ViewFilterOperand.IS_NOT:
    case ViewFilterOperand.IS_EMPTY:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterBoolean = (
  operand: RecordFilterToRecordInputOperand<'BOOLEAN'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.IS:
      return value === 'true';
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterRating = (
  operand: RecordFilterToRecordInputOperand<'RATING'>,
  value: string,
  options?: FilterOption[] | null,
) => {
  const option = options?.find((optionItem) => optionItem.label === value);
  if (!option) {
    return undefined;
  }

  switch (operand) {
    case ViewFilterOperand.IS:
    case ViewFilterOperand.IS_NOT_EMPTY:
      return option.value;
    case ViewFilterOperand.GREATER_THAN_OR_EQUAL: {
      const plusOne = options?.find(
        (optionItem) => optionItem.position === option.position + 1,
      )?.value;
      return plusOne ?? option.value;
    }
    case ViewFilterOperand.LESS_THAN_OR_EQUAL: {
      const minusOne = options?.find(
        (optionItem) => optionItem.position === option.position - 1,
      )?.value;
      return minusOne ?? option.value;
    }
    case ViewFilterOperand.IS_NOT:
    case ViewFilterOperand.IS_EMPTY:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterSelect = (
  operand: RecordFilterToRecordInputOperand<'SELECT'>,
  value: string,
  options?: FilterOption[] | null,
) => {
  switch (operand) {
    case ViewFilterOperand.IS:
    case ViewFilterOperand.IS_NOT_EMPTY:
      try {
        const valueParsed = parseJson<string[]>(value)?.[0];
        const option = options?.find(
          (optionItem) => optionItem.value === valueParsed,
        );
        if (!option) {
          return undefined;
        }
        return option.value;
      } catch {
        return undefined;
      }
    case ViewFilterOperand.IS_NOT:
    case ViewFilterOperand.IS_EMPTY:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterMultiSelect = (
  operand: RecordFilterToRecordInputOperand<'MULTI_SELECT'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.CONTAINS:
    case ViewFilterOperand.IS_NOT_EMPTY:
      try {
        const parsedValue = parseJson<string[]>(value);
        return parsedValue ?? undefined;
      } catch {
        return undefined;
      }
    case ViewFilterOperand.DOES_NOT_CONTAIN:
    case ViewFilterOperand.IS_EMPTY:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterRelation = (
  operand: RecordFilterToRecordInputOperand<'RELATION'>,
  value: string,
  relationType?: RelationType,
  currentWorkspaceMember?: CurrentWorkspaceMember,
  label?: string,
  currentRecordId?: string,
) => {
  switch (operand) {
    case ViewFilterOperand.IS: {
      const parsedValue = parseJson<{
        isCurrentWorkspaceMemberSelected: boolean;
        isCurrentRecordSelected: boolean;
        selectedRecordIds: string[];
      }>(value);
      if (relationType === RelationType.MANY_TO_ONE) {
        if (parsedValue?.isCurrentRecordSelected) {
          return currentRecordId;
        }
        if (label === 'Assignee') {
          return parsedValue?.isCurrentWorkspaceMemberSelected
            ? currentWorkspaceMember?.id
            : undefined;
        } else {
          return parsedValue?.selectedRecordIds?.[0];
        }
      }
      return undefined; // todo
    }
    case ViewFilterOperand.IS_NOT:
    case ViewFilterOperand.IS_NOT_EMPTY: // todo
    case ViewFilterOperand.IS_EMPTY:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterTSVector = (
  operand: RecordFilterToRecordInputOperand<'TS_VECTOR'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.VECTOR_SEARCH:
      return value;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterUUID = (
  operand: RecordFilterToRecordInputOperand<'UUID'>,
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.IS:
      return value;
    case ViewFilterOperand.IS_NOT:
    case ViewFilterOperand.IS_EMPTY:
    case ViewFilterOperand.IS_NOT_EMPTY:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const VALUE_HANDLER_REGISTRY: Partial<Record<FieldMetadataType, ValueHandler>> =
  {
    [FieldMetadataType.TEXT]: ({ operand, value }) =>
      computeValueFromContainsOperand(operand as ContainsBasedOperand, value),
    [FieldMetadataType.ARRAY]: ({ operand, value }) =>
      computeValueFromContainsOperand(operand as ContainsBasedOperand, value),
    [FieldMetadataType.RAW_JSON]: ({ operand, value }) =>
      computeValueFromContainsOperand(operand as ContainsBasedOperand, value),
    [FieldMetadataType.DATE_TIME]: ({ operand, value, timeZone }) =>
      computeValueFromFilterDate(
        operand as RecordFilterToRecordInputOperand<'DATE_TIME'>,
        value,
        false,
        timeZone,
      ),
    [FieldMetadataType.DATE]: ({ operand, value, timeZone }) =>
      computeValueFromFilterDate(
        operand as RecordFilterToRecordInputOperand<'DATE_TIME'>,
        value,
        true,
        timeZone,
      ),
    [FieldMetadataType.NUMBER]: ({ operand, value }) =>
      computeValueFromFilterNumber(
        operand as RecordFilterToRecordInputOperand<'NUMBER'>,
        value,
      ),
    [FieldMetadataType.NUMERIC]: ({ operand, value }) =>
      computeValueFromFilterNumber(
        operand as RecordFilterToRecordInputOperand<'NUMBER'>,
        value,
      ),
    [FieldMetadataType.BOOLEAN]: ({ operand, value }) =>
      computeValueFromFilterBoolean(
        operand as RecordFilterToRecordInputOperand<'BOOLEAN'>,
        value,
      ),
    [FieldMetadataType.RATING]: ({ operand, value, options }) =>
      computeValueFromFilterRating(
        operand as RecordFilterToRecordInputOperand<'RATING'>,
        value,
        options,
      ),
    [FieldMetadataType.SELECT]: ({ operand, value, options }) =>
      computeValueFromFilterSelect(
        operand as RecordFilterToRecordInputOperand<'SELECT'>,
        value,
        options,
      ),
    [FieldMetadataType.MULTI_SELECT]: ({ operand, value }) =>
      computeValueFromFilterMultiSelect(
        operand as RecordFilterToRecordInputOperand<'MULTI_SELECT'>,
        value,
      ),
    [FieldMetadataType.RELATION]: ({
      operand,
      value,
      relationType,
      currentWorkspaceMember,
      currentRecordId,
      label,
    }) =>
      computeValueFromFilterRelation(
        operand as RecordFilterToRecordInputOperand<'RELATION'>,
        value,
        relationType,
        currentWorkspaceMember,
        label,
        currentRecordId,
      ),
    [FieldMetadataType.TS_VECTOR]: ({ operand, value }) =>
      computeValueFromFilterTSVector(
        operand as RecordFilterToRecordInputOperand<'TS_VECTOR'>,
        value,
      ),
    [FieldMetadataType.UUID]: ({ operand, value }) =>
      computeValueFromFilterUUID(
        operand as RecordFilterToRecordInputOperand<'UUID'>,
        value,
      ),
  };

const COMPOSITE_FIELD_VALUE_TRANSFORMERS: Partial<
  Record<FieldMetadataType, (value: unknown, subFieldName: string) => unknown>
> = {
  [FieldMetadataType.CURRENCY]: (value, subFieldName) =>
    subFieldName ===
    COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.CURRENCY]
      .amountMicros
      ? convertCurrencyAmountToCurrencyMicros(Number(value))
      : value,
};

const SUPPORTED_COMPOSITE_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.CURRENCY,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.LINKS,
  FieldMetadataType.EMAILS,
  FieldMetadataType.PHONES,
  FieldMetadataType.ACTOR,
  FieldMetadataType.RICH_TEXT,
];

const computeValueFromSubFieldType = ({
  fieldType,
  filter,
  options,
  relationType,
  currentWorkspaceMember,
  label,
}: {
  fieldType: FieldMetadataType;
  filter: RecordFilter;
  options?: FieldMetadataOptions | null;
  relationType?: RelationType;
  currentWorkspaceMember?: CurrentWorkspaceMember;
  label?: string;
}) => {
  const handler = VALUE_HANDLER_REGISTRY[fieldType];
  if (!handler) {
    return;
  }

  return handler({
    value: filter.value,
    operand: filter.operand,
    options: options as FilterOption[] | null | undefined,
    relationType,
    currentWorkspaceMember,
    label,
  });
};

export const buildCompositeValueFromSubField = ({
  compositeFieldType,
  subFieldName,
  value,
  transformValue,
}: {
  compositeFieldType: FieldMetadataType;
  subFieldName: string;
  value: unknown;
  transformValue?: (value: unknown) => unknown;
}): CompositeValue | undefined => {
  const subFieldProperty = getCompositeSubFieldProperty({
    compositeFieldType,
    subFieldName,
  });

  if (!subFieldProperty) {
    return;
  }

  return {
    [subFieldName]: transformValue ? transformValue(value) : value,
  };
};

const buildCompositeValueFromFilter = ({
  filter,
  relationType,
  currentWorkspaceMember,
  label,
}: CompositeFilterContext) => {
  if (!filter.subFieldName) {
    return;
  }

  const compositeFieldType = filter.type as FieldMetadataType;

  if (!SUPPORTED_COMPOSITE_FIELD_TYPES.includes(compositeFieldType)) {
    return;
  }

  const subFieldProperty = getCompositeSubFieldProperty({
    compositeFieldType,
    subFieldName: filter.subFieldName,
  });

  if (!subFieldProperty) {
    return;
  }

  const operands = getRecordFilterOperands({
    filterType: filter.type,
    subFieldName: filter.subFieldName,
  });

  if (!operands.some((operand) => operand === filter.operand)) {
    throw new Error('Operand not supported for this sub field type');
  }

  const subFieldValue = computeValueFromSubFieldType({
    fieldType: subFieldProperty.type,
    filter,
    options: subFieldProperty.options,
    relationType,
    currentWorkspaceMember,
    label,
  });

  if (subFieldValue === undefined) {
    return;
  }

  const transformValue = COMPOSITE_FIELD_VALUE_TRANSFORMERS[compositeFieldType];

  return buildCompositeValueFromSubField({
    compositeFieldType,
    subFieldName: filter.subFieldName,
    value: subFieldValue,
    transformValue: transformValue
      ? (fieldValue) =>
          transformValue(fieldValue, filter.subFieldName as string)
      : undefined,
  });
};

export const buildValueFromFilter = ({
  filter,
  options,
  relationType,
  currentWorkspaceMember,
  currentRecordId,
  label,
  timeZone,
}: {
  filter: RecordFilter;
  options?: FilterOption[] | null;
  relationType?: RelationType;
  currentWorkspaceMember?: CurrentWorkspaceMember;
  currentRecordId?: string;
  label?: string;
  timeZone?: string;
}) => {
  if (isCompositeFieldType(filter.type)) {
    return buildCompositeValueFromFilter({
      filter,
      relationType,
      currentWorkspaceMember,
      label,
    });
  }

  if (filter.type === 'RAW_JSON') {
    return;
  }

  const operands = FILTER_OPERANDS_MAP[filter.type];
  if (!operands.some((operand) => operand === filter.operand)) {
    throw new Error('Operand not supported for this field type');
  }

  const handler = VALUE_HANDLER_REGISTRY[filter.type as FieldMetadataType];
  if (!handler) {
    return;
  }

  return handler({
    value: filter.value,
    operand: filter.operand,
    options,
    relationType,
    currentWorkspaceMember,
    currentRecordId,
    label,
    timeZone,
  });
};
