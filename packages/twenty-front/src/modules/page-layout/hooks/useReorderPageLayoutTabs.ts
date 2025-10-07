import { calculateNewPosition } from '@/favorites/utils/calculateNewPosition';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { type OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useReorderPageLayoutTabs = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const { setPageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const handleReorderTabs: OnDragEndResponder = useRecoilCallback(
    ({ snapshot }) =>
      (result) => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const { source, destination, draggableId } = result;

        if (!isDefined(destination) || !isDefined(pageLayoutDraft)) return;

        if (
          source.droppableId === destination.droppableId &&
          source.index === destination.index
        ) {
          return;
        }

        const draggedTab = pageLayoutDraft.tabs.find(
          (t) => t.id === draggableId,
        );
        if (!isDefined(draggedTab)) return;

        const tabsWithoutDragged = pageLayoutDraft.tabs.filter(
          (t) => t.id !== draggableId,
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
          tabs: prev.tabs
            .map((tab) =>
              tab.id === draggableId ? { ...tab, position: newPosition } : tab,
            )
            .sort((a, b) => a.position - b.position),
        }));
      },
    [pageLayoutDraftState, setPageLayoutDraft],
  );

  return { handleReorderTabs };
};
