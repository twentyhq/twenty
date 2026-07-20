import { DragDropProvider } from '@dnd-kit/react';
import type { ReactNode } from 'react';

import { useRecordCalendarMonthDndKit } from '@/object-record/record-calendar/month/hooks/useRecordCalendarMonthDndKit';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropColumnDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnDndContext';
import { type DragDropColumnData } from '@/ui/utilities/drag-and-drop/types/DragDropColumnData';

type RecordCalendarMonthDragDropContextProps = {
  children: ReactNode;
};

export const RecordCalendarMonthDragDropContext = ({
  children,
}: RecordCalendarMonthDragDropContextProps) => {
  const { contextValues, handlers } = useRecordCalendarMonthDndKit();

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
