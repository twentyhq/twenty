import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { assertUnreachable } from 'twenty-shared/utils';

export const buildValueFromFilter = (
  filter: RecordFilter,
  type: FilterableFieldType,
) => {
  if (isCompositeField(type)) {
    return;
  }

  if (type === 'RAW_JSON') {
    throw new Error('Raw JSON is not supported');
  }

  const operands = getRecordFilterOperands({
    filterType: type,
  });
  if (!operands.includes(filter.operand)) {
    throw new Error('Operand not supported for this field type');
  }

  switch (type) {
    case 'TEXT':
    case 'RATING': // RATING not working
      return computeValueFromFilterText(filter.operand, filter.value);
    case 'DATE_TIME': // test not working
    case 'DATE': // test not working
      return computeValueFromFilterDate(filter.operand, filter.value);
    case 'NUMBER': // ok
      return computeValueFromFilterNumber(filter.operand, filter.value);
    case 'BOOLEAN': // ok
      return computeValueFromFilterBoolean(filter.operand, filter.value);
    case 'ARRAY': // ok
      return computeValueFromFilterArray(filter.operand, filter.value);
    case 'SELECT':
    case 'MULTI_SELECT':
    case 'RELATION':
      throw new Error('Type not supported');
    default:
      assertUnreachable(type);
  }
};

const computeValueFromFilterText = (
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
