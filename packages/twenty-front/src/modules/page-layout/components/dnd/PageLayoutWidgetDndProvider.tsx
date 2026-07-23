import { DragDropProvider } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { usePageLayoutWidgetDragAndDrop } from '@/page-layout/hooks/usePageLayoutWidgetDragAndDrop';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';

type PageLayoutWidgetDndProviderProps = {
  children: ReactNode;
};

// Mounted in both view and edit mode so toggling edit mode does not remount the
// layout subtree (which would reset scroll position and widget-local state).
// Widget sortables and drop targets only render while editing, so the provider
// is inert in view mode.
export const PageLayoutWidgetDndProvider = ({
  children,
}: PageLayoutWidgetDndProviderProps) => {
  const { handlers } = usePageLayoutWidgetDragAndDrop();

  return (
    <DragDropProvider<PageLayoutWidgetDndData>
      sensors={DND_KIT_SENSORS}
      onDragStart={handlers.onDragStart}
      onDragEnd={handlers.onDragEnd}
    >
      {children}
    </DragDropProvider>
  );
};
