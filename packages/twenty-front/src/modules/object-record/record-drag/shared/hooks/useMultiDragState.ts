import { type MultiDragState } from '@/object-record/record-drag/shared/types/MultiDragState';
import { getDragOperationType } from '@/object-record/record-drag/shared/utils/getDragOperationType';
import { type DragStart } from '@hello-pangea/dnd';
import { useState } from 'react';

export const useMultiDragState = () => {
  const [multiDragState, setMultiDragState] = useState<MultiDragState>({
    isDragging: false,
    draggedRecordIds: [],
    primaryDraggedRecordId: null,
    originalSelection: [],
  });

  const startDrag = (start: DragStart, selectedRecordIds: string[]) => {
    const draggedRecordId = start.draggableId;

    const operationType = getDragOperationType({
      draggedRecordId,
      selectedRecordIds,
    });

    if (operationType === 'multi') {
      setMultiDragState({
        isDragging: true,
        draggedRecordIds: selectedRecordIds,
        primaryDraggedRecordId: draggedRecordId,
        originalSelection: selectedRecordIds,
      });
    } else {
      setMultiDragState({
        isDragging: true,
        draggedRecordIds: [draggedRecordId],
        primaryDraggedRecordId: draggedRecordId,
        originalSelection: [draggedRecordId],
      });
    }
  };

  const endDrag = () => {
    setMultiDragState({
      isDragging: false,
      draggedRecordIds: [],
      primaryDraggedRecordId: null,
      originalSelection: [],
    });
  };

  return {
    multiDragState,
    startDrag,
    endDrag,
  };
};
