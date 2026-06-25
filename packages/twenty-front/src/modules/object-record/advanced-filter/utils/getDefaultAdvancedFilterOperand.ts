import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import {
  type FilterableAndTSVectorFieldType,
  ViewFilterOperand as RecordFilterOperand,
} from 'twenty-shared/types';

// In advanced filters (dashboards, workflows) a freshly added date field
// defaults to "Is relative" instead of "Is": relative ranges (e.g. "Past 1
// week") are the common intent in saved dashboards and automations, where a
// fixed absolute date quickly goes stale. Every other field type keeps its
// first operand, and dates fall back to it too if IS_RELATIVE is unavailable.
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
