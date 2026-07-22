import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { RecordBoardCardDragOverlayContent } from '@/object-record/record-board/record-board-card/components/RecordBoardCardDragOverlayContent';
import { useRecordBoardDndKit } from '@/object-record/record-board/record-board-dnd/hooks/useRecordBoardDndKit';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';

type RecordBoardDndKitProviderProps = {
  children: ReactNode;
};

export const RecordBoardDndKitProvider = ({
  children,
}: RecordBoardDndKitProviderProps) => {
  const { contextValues, handlers } = useRecordBoardDndKit();

  return (
    <DragDropItemDndContext.Provider value={contextValues}>
      <DragDropProvider<DragDropItemData>
        sensors={DND_KIT_SENSORS}
        onDragStart={handlers.onDragStart}
        onDragMove={handlers.onDragMove}
        onDragEnd={handlers.onDragEnd}
      >
        {children}
        <DragOverlay>
          {(source) => <RecordBoardCardDragOverlayContent source={source} />}
        </DragOverlay>
      </DragDropProvider>
    </DragDropItemDndContext.Provider>
  );
};
