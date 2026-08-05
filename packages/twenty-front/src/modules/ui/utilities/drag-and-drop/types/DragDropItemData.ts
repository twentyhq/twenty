import { type DragDropItemDropTargetOrientation } from '@/ui/utilities/drag-and-drop/types/DragDropItemDropTargetOrientation';

export type DragDropItemData = {
  droppableId: string;
  index: number;
  // Lets a resolver pick the split axis per hovered item, so one provider can
  // drive lists of different orientations (e.g. tabs and widgets).
  orientation?: DragDropItemDropTargetOrientation;
};
