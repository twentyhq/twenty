import { DragDropProvider } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { usePageLayoutWidgetDragAndDrop } from '@/page-layout/hooks/usePageLayoutWidgetDragAndDrop';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';

type PageLayoutWidgetDndProviderProps = {
  children: ReactNode;
};

export const PageLayoutWidgetDndProvider = ({
  children,
}: PageLayoutWidgetDndProviderProps) => {
  const { handlers } = usePageLayoutWidgetDragAndDrop();

  return (
    <DragDropProvider<PageLayoutWidgetDndData>
      sensors={DND_KIT_SENSORS}
      onDragStart={handlers.onDragStart}
      onDragOver={handlers.onDragOver}
      onDragEnd={handlers.onDragEnd}
    >
      {children}
    </DragDropProvider>
  );
};
