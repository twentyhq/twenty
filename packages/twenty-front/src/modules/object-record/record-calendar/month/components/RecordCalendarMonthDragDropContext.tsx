import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { useRecordCalendarMonthDndKit } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDndKit';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { type DragDropItemData } from '@/ui/utilities/drag-and-drop/types/DragDropItemData';

type RecordCalendarMonthDragDropContextProps = {
  children: ReactNode;
};

export const RecordCalendarMonthDragDropContext = ({
  children,
}: RecordCalendarMonthDragDropContextProps) => {
  const { contextValues, handlers } = useRecordCalendarMonthDndKit();

  return (
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
  );
};
