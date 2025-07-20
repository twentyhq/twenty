import { DragStart } from '@hello-pangea/dnd';
import { useState } from 'react';
import { getDragOperationType } from '../utils/getDragOperationType';
import { useRecordBoardSelection } from './useRecordBoardSelection';

export interface MultiDragState {
  isDragging: boolean;
  draggedRecordIds: string[];
  primaryDraggedRecordId: string | null;
  originalSelection: string[];
}

export const useMultiDragState = (recordBoardId?: string) => {
  const [multiDragState, setMultiDragState] = useState<MultiDragState>({
    isDragging: false,
    draggedRecordIds: [],
    primaryDraggedRecordId: null,
    originalSelection: [],
  });

  const { setRecordAsSelected } = useRecordBoardSelection(recordBoardId);

  const startDrag = (start: DragStart, selectedRecordIds: string[]) => {
    const draggedRecordId = start.draggableId;

    const operationType = getDragOperationType({
      draggedRecordId,
      selectedRecordIds,
    });

    if (operationType === 'multi') {
      // Temporarily deselect secondary cards - they'll be filtered out from their original positions
      selectedRecordIds
        .filter((id) => id !== draggedRecordId)
        .forEach((id) => setRecordAsSelected(id, false));

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
    // Restore original selection state
    if (multiDragState.originalSelection.length > 1) {
      multiDragState.originalSelection.forEach((id) =>
        setRecordAsSelected(id, true),
      );
    }

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
