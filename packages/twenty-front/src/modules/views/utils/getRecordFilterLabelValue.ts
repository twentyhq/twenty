import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { isEmptinessOperand } from '@/object-record/record-filter/utils/isEmptinessOperand';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';

export const getRecordFilterLabelValue = (recordFilter: RecordFilter) => {
  const operandLabelShort = getOperandLabelShort(recordFilter.operand);
  const operandIsEmptiness = isEmptinessOperand(recordFilter.operand);
  const recordFilterIsEmpty = isRecordFilterConsideredEmpty(recordFilter);

  const isDateOrDateTimeFilter =
    recordFilter.type === 'DATE' || recordFilter.type === 'DATE_TIME';

  if (isDateOrDateTimeFilter) {
    switch (recordFilter.operand) {
      case RecordFilterOperand.IsToday:
      case RecordFilterOperand.IsInFuture:
      case RecordFilterOperand.IsInPast:
        return operandLabelShort;
      default:
        return `${operandLabelShort} ${recordFilter.displayValue}`;
    }
  }

  if (!operandIsEmptiness && !recordFilterIsEmpty) {
    return `${operandLabelShort} ${recordFilter.displayValue}`;
  }

  if (operandIsEmptiness) {
    return `${operandLabelShort}`;
  }

  return recordFilter.displayValue;
};
