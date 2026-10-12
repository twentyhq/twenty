import { type RecordDragData } from '@/object-record/record-drag/types/RecordDragData';

export type RecordTableRowDragData = RecordDragData & {
  focusIndex: number;
};
