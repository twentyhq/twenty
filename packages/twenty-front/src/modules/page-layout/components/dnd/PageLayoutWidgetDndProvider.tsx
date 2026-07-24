import { defaultPreset, Feedback } from '@dnd-kit/dom';
import { DragDropProvider } from '@dnd-kit/react';
import { type ReactNode } from 'react';

import { usePageLayoutWidgetDragAndDrop } from '@/page-layout/hooks/usePageLayoutWidgetDragAndDrop';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';

// A cross-tab drop unmounts the dragged widget in the same commit the drop
// animation waits on (only the active tab renders), which races the clone
// cleanup and can leave the drag feedback stuck on screen. Disabling the drop
// animation makes the feedback cleanup synchronous at drop time.
const PLUGINS_WITHOUT_DROP_ANIMATION = defaultPreset.plugins.map((plugin) =>
  plugin === Feedback ? Feedback.configure({ dropAnimation: null }) : plugin,
);

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
      plugins={PLUGINS_WITHOUT_DROP_ANIMATION}
      onDragStart={handlers.onDragStart}
      onDragEnd={handlers.onDragEnd}
    >
      {children}
    </DragDropProvider>
  );
};
