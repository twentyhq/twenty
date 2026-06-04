import { useProcessTableColumnDrop } from '@/object-record/record-table/record-table-header/hooks/useProcessTableColumnDrop';
import { isRecordTableHeaderDropProcessingComponentState } from '@/object-record/record-table/record-table-header/states/isRecordTableHeaderDropProcessingComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { DragDropContext, type OnDragEndResponder } from '@hello-pangea/dnd';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const RecordTableHeaderDragDropContext = ({
  children,
}: React.PropsWithChildren) => {
  const store = useStore();

  const { processTableColumnDrop } = useProcessTableColumnDrop();

  const isRecordTableHeaderDropProcessingCallbackState =
    useAtomComponentStateCallbackState(
      isRecordTableHeaderDropProcessingComponentState,
    );

  const handleDragStart = useCallback(() => {
    store.set(isRecordTableHeaderDropProcessingCallbackState, true);
  }, [store, isRecordTableHeaderDropProcessingCallbackState]);

  const handleDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      if (!result.destination) {
        store.set(isRecordTableHeaderDropProcessingCallbackState, false);
        return;
      }

      try {
        processTableColumnDrop(result);
      } catch (error) {
        store.set(isRecordTableHeaderDropProcessingCallbackState, false);
        throw error;
      }
    },
    [
      processTableColumnDrop,
      store,
      isRecordTableHeaderDropProcessingCallbackState,
    ],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
