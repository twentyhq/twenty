import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';

export const isEmptinessOperand = (operand: RecordFilterOperand): boolean => {
  return [RecordFilterOperand.IsEmpty, RecordFilterOperand.IsNotEmpty].includes(
    operand,
  );
};
