import { PointerActivationConstraints } from '@dnd-kit/dom';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import type { ReactNode } from 'react';

import type { DraggableData } from '@/navigation-menu-item/common/types/navigationMenuItemDndKitDraggableData';
import { RecordTableHeaderDndContext } from '@/object-record/record-table/record-table-header/dnd/context/RecordTableHeaderDndContext';
import { useRecordTableHeaderDndKit } from '@/object-record/record-table/record-table-header/dnd/hooks/useRecordTableHeaderDndKit';

const RECORD_TABLE_HEADER_DND_SENSORS = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
];

type RecordTableHeaderDndKitProviderProps = {
  children: ReactNode;
};

export const RecordTableHeaderDndKitProvider = ({
  children,
}: RecordTableHeaderDndKitProviderProps) => {
  const { contextValues, handlers } = useRecordTableHeaderDndKit();

  return (
    <RecordTableHeaderDndContext.Provider value={contextValues}>
      <DragDropProvider<DraggableData>
        sensors={RECORD_TABLE_HEADER_DND_SENSORS}
        onDragStart={handlers.onDragStart}
        onDragMove={handlers.onDragMove}
        onDragEnd={handlers.onDragEnd}
      >
        {children}
      </DragDropProvider>
    </RecordTableHeaderDndContext.Provider>
  );
};
