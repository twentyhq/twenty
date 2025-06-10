import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { isEmptinessOperand } from '@/object-record/record-filter/utils/isEmptinessOperand';
import { isDefined } from 'twenty-shared/utils';

export const checkIfShouldSkipFiltering = ({
  recordFilter,
}: {
  recordFilter: RecordFilter;
}) => {
  const isAnEmptinessOperand = isEmptinessOperand(recordFilter.operand);

  const isDateOperandWithoutValue = [
    RecordFilterOperand.IsInPast,
    RecordFilterOperand.IsInFuture,
    RecordFilterOperand.IsToday,
  ].includes(recordFilter.operand);

  const isFilterValueEmpty =
    !isDefined(recordFilter.value) || recordFilter.value === '';

  const shouldSkipFiltering =
    !isAnEmptinessOperand && !isDateOperandWithoutValue && isFilterValueEmpty;

  return shouldSkipFiltering;
};
