import { useProcessTableColumnDrop } from '@/object-record/record-table/record-table-header/hooks/useProcessTableColumnDrop';
import { useResetRecordTableHeaderDragStates } from '@/object-record/record-table/record-table-header/hooks/useResetRecordTableHeaderDragState';
import { isRecordTableHeaderDropProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderDropProcessingComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { DragDropContext, type OnDragEndResponder } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const RecordTableHeaderDragDropContext = ({
  children,
}: React.PropsWithChildren) => {
  const store = useStore();

  const isRecordTableHeaderDropProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableHeaderDropProcessingComponentState,
    );

  const { processTableColumnDrop } = useProcessTableColumnDrop();

  const { resetRecordTableHeaderDragStates } =
    useResetRecordTableHeaderDragStates();

  const handleDragStart = useCallback(() => {
    store.set(isRecordTableHeaderDropProcessingCallbackState, true);
  }, [store, isRecordTableHeaderDropProcessingCallbackState]);

  const handleDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) {
        resetRecordTableHeaderDragStates();
        return;
      }

      try {
        processTableColumnDrop(result);
      } catch (error) {
        resetRecordTableHeaderDragStates();
        throw error;
      }
    },
    [processTableColumnDrop, resetRecordTableHeaderDragStates],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
