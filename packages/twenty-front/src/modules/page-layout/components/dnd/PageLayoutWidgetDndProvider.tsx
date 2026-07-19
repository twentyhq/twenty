import { DragDropProvider } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { usePageLayoutWidgetDragAndDrop } from '@/page-layout/hooks/usePageLayoutWidgetDragAndDrop';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';

type PageLayoutWidgetDndProviderProps = {
  children: ReactNode;
};

type PageLayoutWidgetDndProviderInEditModeProps = {
  children: ReactNode;
};

const PageLayoutWidgetDndProviderInEditMode = ({
  children,
}: PageLayoutWidgetDndProviderInEditModeProps) => {
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

// Widget drag-and-drop only exists while editing the layout, so the provider
// (and its drag lifecycle hook) is skipped entirely in view mode.
export const PageLayoutWidgetDndProvider = ({
  children,
}: PageLayoutWidgetDndProviderProps) => {
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  if (!isPageLayoutInEditMode) {
    return <>{children}</>;
  }

  return (
    <PageLayoutWidgetDndProviderInEditMode>
      {children}
    </PageLayoutWidgetDndProviderInEditMode>
  );
};
