import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';

export type RecordTableRowDragData = DragDropItemData & {
  recordId: string;
  focusIndex: number;
};
