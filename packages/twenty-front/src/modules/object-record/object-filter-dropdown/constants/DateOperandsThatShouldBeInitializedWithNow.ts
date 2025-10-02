import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';

export const DATE_OPERANDS_THAT_SHOULD_BE_INITIALIZED_WITH_NOW: RecordFilterOperand[] =
  [
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
    RecordFilterOperand.IS_AFTER,
    RecordFilterOperand.IS_BEFORE,
  ];
