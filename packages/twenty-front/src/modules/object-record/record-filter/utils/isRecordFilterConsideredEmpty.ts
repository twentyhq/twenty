import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { isDefined } from 'twenty-shared/utils';

export const isRecordFilterConsideredEmpty = (
  recordFilter: RecordFilter,
): boolean => {
  const { value, operand } = recordFilter;

  if (
    (!isDefined(value) || value === '' || value === '[]') &&
    ![
      RecordFilterOperand.IsEmpty,
      RecordFilterOperand.IsNotEmpty,
      RecordFilterOperand.IsInPast,
      RecordFilterOperand.IsInFuture,
      RecordFilterOperand.IsToday,
    ].includes(operand)
  ) {
    return true;
  }

  return false;
};
