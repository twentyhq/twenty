import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { useGetRecordFilterDisplayValue } from '@/object-record/record-filter/hooks/useGetRecordFilterDisplayValue';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { isEmptinessOperand } from 'twenty-shared/utils';

export const useGetRecordFilterChipLabelValue = () => {
  const { getRecordFilterDisplayValue } = useGetRecordFilterDisplayValue();

  const getRecordFilterChipLabelValue = ({
    recordFilter,
  }: {
    recordFilter: RecordFilter;
  }) => {
    const operandLabelShort = getOperandLabelShort(recordFilter.operand);
    const operandIsEmptiness = isEmptinessOperand(recordFilter.operand);
    const recordFilterIsEmpty = isRecordFilterConsideredEmpty(recordFilter);

    const recordFilterDisplayValue = getRecordFilterDisplayValue(recordFilter);

    if (!operandIsEmptiness && !recordFilterIsEmpty) {
      return `${operandLabelShort} ${recordFilterDisplayValue}`;
    }

    if (operandIsEmptiness) {
      return `${operandLabelShort}`;
    }

    return recordFilterDisplayValue;
  };

  return { getRecordFilterChipLabelValue };
};
