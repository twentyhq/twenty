import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { useRecordBoardColumnDndKit } from '@/object-record/record-board/record-board-column/dnd/hooks/useRecordBoardColumnDndKit';
import { RecordGroupReorderConfirmationModal } from '@/object-record/record-group/components/RecordGroupReorderConfirmationModal';
import { DragDropColumnDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnDndContext';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { type DragDropColumnData } from '@/ui/utilities/drag-and-drop/types/DragDropColumnData';

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
      <DragDropColumnDndContext.Provider value={contextValues}>
        <DragDropProvider<DragDropColumnData>
          sensors={DND_KIT_SENSORS}
          onDragStart={handlers.onDragStart}
          onDragMove={handlers.onDragMove}
          onDragEnd={handlers.onDragEnd}
        >
          {children}
        </DragDropProvider>
      </DragDropColumnDndContext.Provider>
      <RecordGroupReorderConfirmationModal
        onConfirmClick={handlePendingReorderConfirmClick}
      />
    </>
  );
};
