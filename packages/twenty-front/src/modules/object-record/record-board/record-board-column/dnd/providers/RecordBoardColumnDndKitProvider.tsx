import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { RecordBoardColumnDndContext } from '@/object-record/record-board/record-board-column/dnd/context/RecordBoardColumnDndContext';
import { useRecordBoardColumnDndKit } from '@/object-record/record-board/record-board-column/dnd/hooks/useRecordBoardColumnDndKit';
import { type RecordBoardColumnDndData } from '@/object-record/record-board/record-board-column/dnd/types/RecordBoardColumnDndData';
import { RecordGroupReorderConfirmationModal } from '@/object-record/record-group/components/RecordGroupReorderConfirmationModal';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';

type RecordBoardColumnDndKitProviderProps = {
  children: ReactNode;
};

export const RecordBoardColumnDndKitProvider = ({
  children,
}: RecordBoardColumnDndKitProviderProps) => {
  const { contextValues, handlers, handlePendingReorderConfirmClick } =
    useRecordBoardColumnDndKit();

  return (
    <>
      <RecordBoardColumnDndContext.Provider value={contextValues}>
        <DragDropProvider<RecordBoardColumnDndData>
          sensors={DND_KIT_SENSORS}
          onDragStart={handlers.onDragStart}
          onDragMove={handlers.onDragMove}
          onDragEnd={handlers.onDragEnd}
        >
          {children}
        </DragDropProvider>
      </RecordBoardColumnDndContext.Provider>
      <RecordGroupReorderConfirmationModal
        onConfirmClick={handlePendingReorderConfirmClick}
      />
    </>
  );
};
