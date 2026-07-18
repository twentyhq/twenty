import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { useRecordBoardDndKit } from '@/object-record/record-board/record-board-dnd/hooks/useRecordBoardDndKit';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropColumnDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnDndContext';
import { type DragDropColumnData } from '@/ui/utilities/drag-and-drop/types/DragDropColumnData';

type RecordBoardDndKitProviderProps = {
  children: ReactNode;
};

export const RecordBoardDndKitProvider = ({
  children,
}: RecordBoardDndKitProviderProps) => {
  const { contextValues, handlers } = useRecordBoardDndKit();

  return (
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
  );
};
