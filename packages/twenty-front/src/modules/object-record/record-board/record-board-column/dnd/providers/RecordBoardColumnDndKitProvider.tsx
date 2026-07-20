import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { useRecordBoardColumnDndKit } from '@/object-record/record-board/record-board-column/dnd/hooks/useRecordBoardColumnDndKit';
import { RecordGroupReorderConfirmationModal } from '@/object-record/record-group/components/RecordGroupReorderConfirmationModal';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';

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
      <DragDropItemDndContext.Provider value={contextValues}>
        <DragDropProvider<DragDropItemData>
          sensors={DND_KIT_SENSORS}
          onDragStart={handlers.onDragStart}
          onDragMove={handlers.onDragMove}
          onDragEnd={handlers.onDragEnd}
        >
          {children}
        </DragDropProvider>
      </DragDropItemDndContext.Provider>
      <RecordGroupReorderConfirmationModal
        onConfirmClick={handlePendingReorderConfirmClick}
      />
    </>
  );
};
