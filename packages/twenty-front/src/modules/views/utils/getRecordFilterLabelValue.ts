import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { isEmptinessOperand, parseJson } from 'twenty-shared/utils';

export const getRecordFilterLabelValue = ({
  recordFilter,
  fieldMetadataOptions,
}: {
  recordFilter: RecordFilter;
  fieldMetadataOptions?: FieldMetadataItemOption[];
}) => {
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
  if (recordFilter.type === 'SELECT' || recordFilter.type === 'MULTI_SELECT') {
    const valueArray = parseJson<string[]>(recordFilter.value);

    if (!Array.isArray(valueArray)) {
      return '';
    }

    const optionLabels = valueArray.map(
      (value) =>
        fieldMetadataOptions?.find((option) => option.value === value)?.label,
    );

    return `${operandLabelShort} ${optionLabels.join(', ')}`;
  }

  if (!operandIsEmptiness && !recordFilterIsEmpty) {
    return `${operandLabelShort} ${recordFilter.displayValue}`;
  }

  if (operandIsEmptiness) {
    return `${operandLabelShort}`;
  }

  return recordFilter.displayValue;
};
