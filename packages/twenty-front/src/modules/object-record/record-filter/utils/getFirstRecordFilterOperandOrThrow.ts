import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import {
  type FilterableAndTSVectorFieldType,
  type ViewFilterOperand as RecordFilterOperand,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

export const getFirstRecordFilterOperandOrThrow = ({
  filterType,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string | null;
}): RecordFilterOperand => {
  const [firstOperand] = getRecordFilterOperands({ filterType, subFieldName });

  assertIsDefinedOrThrow(
    firstOperand,
    new Error(`No operand available for filter type: ${filterType}`),
  );

  return firstOperand;
};
