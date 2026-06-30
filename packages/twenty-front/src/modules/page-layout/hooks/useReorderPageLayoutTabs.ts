import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
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

      const sortedTabs = sortTabsByPosition(
        currentPageLayout.tabs.filter((tab) => tab.isActive),
      );

      const draggedTab = sortedTabs.find((tab) => tab.id === draggableId);
      if (!isDefined(draggedTab)) {
        return false;
      }

      const isDropOnMoreButton =
        destination.droppableId ===
        PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.MORE_BUTTON;

      const orderedIds = sortedTabs
        .map((tab) => tab.id)
        .filter((id) => id !== draggableId);

      const movingBetweenDroppables =
        source.droppableId !== destination.droppableId;

      const insertIndex = isDropOnMoreButton
        ? orderedIds.length
        : movingBetweenDroppables && destination.index > source.index
          ? destination.index - 1
          : destination.index;

      orderedIds.splice(insertIndex, 0, draggableId);

      const newPositionById = new Map(
        orderedIds.map((id, index) => [id, index]),
      );

      setPageLayoutDraft((prev) => ({
        ...prev,
        tabs: prev.tabs.map((tab) => {
          const newPosition = newPositionById.get(tab.id);
          return isDefined(newPosition)
            ? { ...tab, position: newPosition }
            : tab;
        }),
      }));

      return isDropOnMoreButton;
    },
    [currentPageLayout, setPageLayoutDraft],
  );

  return { reorderTabs };
};
