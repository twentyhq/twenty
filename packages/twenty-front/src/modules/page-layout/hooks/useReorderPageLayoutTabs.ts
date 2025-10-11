import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type DropResult } from '@hello-pangea/dnd';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useReorderPageLayoutTabs = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const { currentPageLayout } = useCurrentPageLayout();
  const { setPageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

  const reorderTabs = useCallback(
    (result: DropResult): boolean => {
      const { source, destination, draggableId } = result;

      if (!isDefined(destination) || !isDefined(currentPageLayout)) {
        return false;
      }

      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return false;
      }

      const sortedTabs = [...currentPageLayout.tabs].sort(
        (a, b) => a.position - b.position,
      );

      const draggedTab = sortedTabs.find((tab) => tab.id === draggableId);
      if (!isDefined(draggedTab)) {
        return false;
      }

      if (
        destination.droppableId ===
        PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.MORE_BUTTON
      ) {
        const maxPosition =
          sortedTabs.length > 0
            ? Math.max(...sortedTabs.map((tab) => tab.position))
            : 0;

        setPageLayoutDraft((prev) => ({
          ...prev,
          tabs: prev.tabs.map((tab) =>
            tab.id === draggableId
              ? { ...tab, position: maxPosition + 1 }
              : tab,
          ),
        }));

        return true;
      }

      const tabsWithoutDragged = sortedTabs.filter(
        (tab) => tab.id !== draggableId,
      );

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

      return false;
    },
    [currentPageLayout, setPageLayoutDraft],
  );

  return { reorderTabs };
};
