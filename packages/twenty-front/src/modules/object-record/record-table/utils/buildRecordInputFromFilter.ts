import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { RecordFilterInput } from '@/object-record/record-filter/types/RecordFilter';
import { FILTER_OPERANDS_MAP } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { assertUnreachable } from 'twenty-shared/utils';

export const buildValueFromFilter = ({
  filter,
  options,
}: {
  filter: RecordFilterInput;
  options?: FieldMetadataItemOption[];
}) => {
  if (isCompositeField(filter.type)) {
    return;
  }

  if (filter.type === 'RAW_JSON') {
    return;
  }

  switch (filter.type) {
    case 'TEXT': {
      // ok
      const operands = FILTER_OPERANDS_MAP[filter.type];

      if (!operands.some((operand) => operand === filter.operand)) {
        throw new Error('Operand not supported for this field type');
      }

      return computeValueFromFilterText(filter.operand, filter.value);
    }
    case 'RATING': // ok
      return computeValueFromFilterRating(
        filter.operand,
        filter.value,
        options,
      );
    case 'DATE_TIME': // ok
    case 'DATE': // ok
      return computeValueFromFilterDate(filter.operand, filter.value);
    case 'NUMBER': // ok
      return computeValueFromFilterNumber(filter.operand, filter.value);
    case 'BOOLEAN': // ok
      return computeValueFromFilterBoolean(filter.operand, filter.value);
    case 'ARRAY': // ok
      return computeValueFromFilterArray(filter.operand, filter.value);
    case 'SELECT': // ok
      return computeValueFromFilterSelect(
        filter.operand,
        filter.value,
        options,
      );
    case 'MULTI_SELECT': // ok
      return computeValueFromFilterMultiSelect(filter.operand, filter.value);
    case 'RELATION': // TODO
      throw new Error('Type not supported');
    default:
      assertUnreachable(filter.type);
  }
};

const computeValueFromFilterText = (
  operand: (typeof FILTER_OPERANDS_MAP.TEXT)[number], // TODO: add type better scoping
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
  operand: ViewFilterOperand, // TODO: add type better scoping
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
      return new Date(value);
    case ViewFilterOperand.IsNot:
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
      // assertUnreachable(operand);
      return new Date(value);
  }
};

const computeValueFromFilterNumber = (
  operand: ViewFilterOperand, // TODO: add type better scoping
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
      // assertUnreachable(operand);
      return Number(value);
  }
};

const computeValueFromFilterBoolean = (
  operand: ViewFilterOperand, // TODO: add type better scoping
  value: string,
) => {
  switch (operand) {
    case ViewFilterOperand.Is:
      return value === 'true';
    default:
      // assertUnreachable(operand);
      return value === 'true';
  }
};

const computeValueFromFilterArray = (
  operand: ViewFilterOperand, // TODO: add type better scoping
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
      // assertUnreachable(operand);
      return value;
  }
};

const computeValueFromFilterRating = (
  operand: ViewFilterOperand, // TODO: add type better scoping
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
      // assertUnreachable(operand);
      return undefined;
  }
};

const computeValueFromFilterSelect = (
  operand: ViewFilterOperand, // TODO: add type better scoping
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
      // assertUnreachable(operand);
      return undefined;
  }
};

const computeValueFromFilterMultiSelect = (
  operand: ViewFilterOperand, // TODO: add type better scoping
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
      // assertUnreachable(operand);
      return undefined;
  }
};
