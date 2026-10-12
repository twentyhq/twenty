import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';

export type RecordDragData = DragDropItemData & {
  recordId: string;
};
