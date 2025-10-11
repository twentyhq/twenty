import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { isDefined } from 'twenty-shared/utils';

export const isRecordFilterConsideredEmpty = (
  recordFilter: RecordFilter,
): boolean => {
  const { value, operand } = recordFilter;

  if (
    (!isDefined(value) || value === '' || value === '[]') &&
    ![
      RecordFilterOperand.IS_EMPTY,
      RecordFilterOperand.IS_NOT_EMPTY,
      RecordFilterOperand.IS_IN_PAST,
      RecordFilterOperand.IS_IN_FUTURE,
      RecordFilterOperand.IS_TODAY,
    ].includes(operand)
  ) {
    return true;
  }

  return false;
};
