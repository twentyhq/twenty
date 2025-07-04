import { MultiDragStateContext } from '@/object-record/record-board/components/RecordBoard';
import { useContext, useMemo } from 'react';

export const useFilteredRecordIds = (recordIds: string[]) => {
  const multiDragState = useContext(MultiDragStateContext);

  return useMemo(() => {
    if (!multiDragState.isDragging) {
      return recordIds;
    }

    // During drag, filter out dragged records except the primary one
    // This creates a virtual list pattern that @hello-pangea/dnd warns about
    // but it's intentional for our multi-drag UX
    // come back to this
    return recordIds.filter(
      (recordId) =>
        !multiDragState.draggedRecordIds.includes(recordId) ||
        recordId === multiDragState.primaryDraggedRecordId,
    );
  }, [recordIds, multiDragState]);
};
