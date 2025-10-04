import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useReorderPageLayoutTabs = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const { currentPageLayout } = useCurrentPageLayout();
  const { setPageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

  const handleReorderTabs: OnDragEndResponder = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;

      if (!isDefined(destination) || !isDefined(currentPageLayout)) return;

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const sortedTabs = [...currentPageLayout.tabs].sort(
        (a, b) => a.position - b.position,
      );

      const draggedTab = sortedTabs.find((t) => t.id === draggableId);
      if (!isDefined(draggedTab)) return;

      const tabsWithoutDragged = sortedTabs.filter((t) => t.id !== draggableId);

      const movingBetweenDroppables =
        source.droppableId !== destination.droppableId;

      const destinationIndexAdjusted =
        movingBetweenDroppables && destination.index > source.index
          ? destination.index - 1
          : destination.index;

      const newPosition = calculateNewPosition({
        destinationIndex: destinationIndexAdjusted,
        sourceIndex: source.index,
        items: tabsWithoutDragged,
      });

      setPageLayoutDraft((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) =>
          tab.id === draggableId ? { ...tab, position: newPosition } : tab,
        ),
      }));
    },
    [currentPageLayout, setPageLayoutDraft],
  );

  return { handleReorderTabs };
};
