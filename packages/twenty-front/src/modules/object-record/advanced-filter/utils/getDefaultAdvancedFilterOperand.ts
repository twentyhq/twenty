import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import {
  type FilterableAndTSVectorFieldType,
  ViewFilterOperand as RecordFilterOperand,
} from 'twenty-shared/types';
import { getFirstRecordFilterOperandOrThrow } from '@/object-record/record-filter/utils/getFirstRecordFilterOperandOrThrow';

export const getDefaultAdvancedFilterOperand = ({
  filterType,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string | null;
}): RecordFilterOperand => {
  const isDateFilterType = filterType === 'DATE' || filterType === 'DATE_TIME';

  if (
    isDateFilterType &&
    getRecordFilterOperands({ filterType, subFieldName }).includes(
      RecordFilterOperand.IS_RELATIVE,
    )
  ) {
    return RecordFilterOperand.IS_RELATIVE;
  }

  return getFirstRecordFilterOperandOrThrow({ filterType, subFieldName });
};
