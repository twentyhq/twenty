import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';

export const getRowSlotTop = (rowIndex: number) =>
  (rowIndex + 1) * (RECORD_TABLE_ROW_HEIGHT + 1);
