import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import {
  RecordFilter,
  RecordFilterInput,
} from '@/object-record/record-filter/types/RecordFilter';
import { FILTER_OPERANDS_MAP } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { assertUnreachable } from 'twenty-shared/utils';

// const assertIsTextFiler = (
//   filter: RecordFilterInput,
// ): filter is RecordFilterInput<'TEXT'> => filter.type === 'TEXT';

type RecordFilterToRecordInputOperand<T extends FilterableFieldType> =
  (typeof FILTER_OPERANDS_MAP)[T][number];

export const buildValueFromFilter = ({
  filter,
  options,
}: {
  filter: RecordFilter;
  options?: FieldMetadataItemOption[];
}) => {
  if (isCompositeField(filter.type)) {
    return;
  }

  if (filter.type === 'RAW_JSON') {
    return;
  }

  const operands = FILTER_OPERANDS_MAP[filter.type];
  if (!operands.some((operand) => operand === filter.operand)) {
    throw new Error('Operand not supported for this field type');
  }

  switch (filter.type) {
    case 'TEXT': {
      // if (!assertIsTextFiler(filter)) {
      //   throw new Error('Operand not supported for this field type');
      // }
      return computeValueFromFilterText(
        filter.operand as RecordFilterInput<'TEXT'>['operand'],
        filter.value,
      );
    }
    case 'RATING': // ok
      return computeValueFromFilterRating(
        filter.operand as RecordFilterInput<'RATING'>['operand'],
        filter.value,
        options,
      );
    case 'DATE_TIME': // ok
    case 'DATE': // ok
      return computeValueFromFilterDate(
        filter.operand as RecordFilterInput<'DATE_TIME'>['operand'],
        filter.value,
      );
    case 'NUMBER': // ok
      return computeValueFromFilterNumber(
        filter.operand as RecordFilterInput<'NUMBER'>['operand'],
        filter.value,
      );
    case 'BOOLEAN': // ok
      return computeValueFromFilterBoolean(
        filter.operand as RecordFilterInput<'BOOLEAN'>['operand'],
        filter.value,
      );
    case 'ARRAY': // ok
      return computeValueFromFilterArray(
        filter.operand as RecordFilterInput<'ARRAY'>['operand'],
        filter.value,
      );
    case 'SELECT': // ok
      return computeValueFromFilterSelect(
        filter.operand as RecordFilterInput<'SELECT'>['operand'],
        filter.value,
        options,
      );
    case 'MULTI_SELECT': // ok
      return computeValueFromFilterMultiSelect(
        filter.operand as RecordFilterInput<'MULTI_SELECT'>['operand'],
        filter.value,
      );
    case 'RELATION': // TODO
      throw new Error('Type not supported');
    default:
      assertUnreachable(filter.type);
  }
};

const computeValueFromFilterText = (
  operand: RecordFilterToRecordInputOperand<'TEXT'>, // TODO: add type better scoping
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Contains:
      return value;
    case ViewFilterOperand.DoesNotContain:
      return undefined;
    case ViewFilterOperand.IsNotEmpty:
      return value;
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
      return value;
  }
};

const computeValueFromFilterDate = (
  operand: RecordFilterToRecordInputOperand<'DATE_TIME'>, // TODO: add type better scoping
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
      return new Date(value);
    case ViewFilterOperand.IsNotEmpty:
      return new Date(value);
    case ViewFilterOperand.IsAfter:
      return new Date(value);
    case ViewFilterOperand.IsBefore:
      return new Date(value);
    case ViewFilterOperand.IsInPast:
      return new Date(value);
    case ViewFilterOperand.IsInFuture:
      return new Date(value);
    case ViewFilterOperand.IsToday:
      return new Date();
    case ViewFilterOperand.IsRelative:
      return new Date();
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterNumber = (
  operand: RecordFilterToRecordInputOperand<'NUMBER'>, // TODO: add type better scoping
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.GreaterThan:
      return Number(value) + 1;
    case ViewFilterOperand.LessThan:
      return Number(value) - 1;
    case ViewFilterOperand.IsNotEmpty:
      return Number(value);
    case ViewFilterOperand.IsEmpty:
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
    case ViewFilterOperand.Is:
      return value === 'true';
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterArray = (
  operand: RecordFilterToRecordInputOperand<'ARRAY'>, // TODO: add type better scoping
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Contains:
      return value;
    case ViewFilterOperand.DoesNotContain:
      return undefined;
    case ViewFilterOperand.IsNotEmpty:
      return value;
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterRating = (
  operand: RecordFilterToRecordInputOperand<'RATING'>, // TODO: add type better scoping
  value: string,
  options?: FieldMetadataItemOption[],
) => {
  const option = options?.find((option) => option.label === value);
  if (!option) {
    return undefined;
  }

  switch (operand) {
    case ViewFilterOperand.Is:
      return option.value;
    case ViewFilterOperand.IsNotEmpty:
      return option.value;
    case ViewFilterOperand.IsEmpty:
      return undefined;
    case ViewFilterOperand.GreaterThan:
      return option.value;
    case ViewFilterOperand.LessThan:
      return option.value;
    default:
      assertUnreachable(operand);
      return undefined;
  }
};

const computeValueFromFilterSelect = (
  operand: RecordFilterToRecordInputOperand<'SELECT'>, // TODO: add type better scoping
  value: string,
  options?: FieldMetadataItemOption[],
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
      try {
        const valueParsed = JSON.parse(value)?.[0];
        const option = options?.find((option) => option.value === valueParsed);
        if (!option) {
          return undefined;
        }
        return option.value;
      } catch (error) {
        return undefined;
      }

    case ViewFilterOperand.IsNot:
      return undefined;
    case ViewFilterOperand.IsNotEmpty:
      try {
        const valueParsed = JSON.parse(value)?.[0];
        const option = options?.find((option) => option.value === valueParsed);
        if (!option) {
          return undefined;
        }
        return option.value;
      } catch (error) {
        return undefined;
      }
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};

const computeValueFromFilterMultiSelect = (
  operand: RecordFilterToRecordInputOperand<'MULTI_SELECT'>, // TODO: add type better scoping
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Contains:
      try {
        return JSON.parse(value);
      } catch (error) {
        return undefined;
      }
    case ViewFilterOperand.DoesNotContain:
      return undefined;
    case ViewFilterOperand.IsNotEmpty:
      try {
        return JSON.parse(value);
      } catch (error) {
        return undefined;
      }
    case ViewFilterOperand.IsEmpty:
      return undefined;
    default:
      assertUnreachable(operand);
  }
};
