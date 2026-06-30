import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import {
  type FilterableAndTSVectorFieldType,
  ViewFilterOperand as RecordFilterOperand,
} from 'twenty-shared/types';

export const getDefaultAdvancedFilterOperand = ({
  filterType,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string | null;
}): RecordFilterOperand => {
  const availableOperands = getRecordFilterOperands({
    filterType,
    subFieldName,
  });

  const isDateFilterType = filterType === 'DATE' || filterType === 'DATE_TIME';

  if (
    isDateFilterType &&
    availableOperands.includes(RecordFilterOperand.IS_RELATIVE)
  ) {
    return RecordFilterOperand.IS_RELATIVE;
  }

  return availableOperands[0];
};
