import { RECORD_TABLE_CELL_INPUT_ID_PREFIX } from '@/object-record/record-table/constants/RecordTableCellInputIdPrefix';

// Keyed by column, not field: two columns of one field must not share editor state
export const getRecordTableCellInputIdPrefix = (recordFieldId: string) =>
  `${RECORD_TABLE_CELL_INPUT_ID_PREFIX}-${recordFieldId}`;
