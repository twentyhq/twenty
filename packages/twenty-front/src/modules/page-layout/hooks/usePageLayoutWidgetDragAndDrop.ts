import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { moveWidgetToTabInDraft } from '@/page-layout/utils/moveWidgetToTabInDraft';
import { moveWidgetWithinTabInDraft } from '@/page-layout/utils/moveWidgetWithinTabInDraft';
import { reorderTabInDraft } from '@/page-layout/utils/reorderTabInDraft';
import { resolveBeforeTabId } from '@/page-layout/utils/resolveBeforeTabId';
import { type DragDropInsertionContextValues } from '@/ui/utilities/drag-and-drop/hooks/useDragDropInsertionIndex';
import { type DragDropProviderDragEndEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragEndEvent';
import { type DragDropProviderDragMoveEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragMoveEvent';
import { type DragDropProviderDragStartEvent } from '@/ui/utilities/drag-and-drop/types/DragDropProviderDragStartEvent';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { resolveDropFromPointer } from '@/ui/utilities/drag-and-drop/utils/resolveDropFromPointer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

type DragStartEvent = DragDropProviderDragStartEvent<PageLayoutWidgetDndData>;
type DragMoveEvent = DragDropProviderDragMoveEvent<PageLayoutWidgetDndData>;
type DragEndEvent = DragDropProviderDragEndEvent<PageLayoutWidgetDndData>;

export const usePageLayoutWidgetDragAndDrop = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const setPageLayoutDraggingWidgetId = useSetAtomComponentState(
    pageLayoutDraggingWidgetIdComponentState,
    pageLayoutId,
  );

  const [activeDropTargetIndex, setActiveDropTargetIndex] = useState<
    number | null
  >(null);
  const [activeDroppableId, setActiveDroppableId] = useState<string | null>(
    null,
  );

  const clearWidgetDropTarget = useCallback(() => {
    setActiveDropTargetIndex(null);
    setActiveDroppableId(null);
  }, []);

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const sourceData = event.operation.source?.data as
        | PageLayoutWidgetDndData
        | undefined;

      clearWidgetDropTarget();

      if (sourceData?.type === 'widget') {
        setPageLayoutDraggingWidgetId(sourceData.widgetId);
      }
    },
    [clearWidgetDropTarget, setPageLayoutDraggingWidgetId],
  );

  const onDragMove = useCallback(
    (event: DragMoveEvent) => {
      const sourceData = event.operation.source?.data as
        | PageLayoutWidgetDndData
        | undefined;
      const targetData = event.operation.target?.data as
        | PageLayoutWidgetDndData
        | undefined;

      const isWidgetReorder =
        sourceData?.type === 'widget' && targetData?.type === 'widget';
      const isTabReorder =
        sourceData?.type === 'tab' && targetData?.type === 'tab';

      if (!isWidgetReorder && !isTabReorder) {
        clearWidgetDropTarget();
        return;
      }

      const resolvedDrop = resolveDropFromPointer({
        target: event.operation.target,
        pointer: event.operation.position.current,
        getDroppableItemCount: () => 0,
      });

      setActiveDropTargetIndex(resolvedDrop?.dropTargetIndex ?? null);
      setActiveDroppableId(resolvedDrop?.droppableId ?? null);
    },
    [clearWidgetDropTarget],
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const sourceData = event.operation.source?.data as
        | PageLayoutWidgetDndData
        | undefined;
      const targetData = event.operation.target?.data as
        | PageLayoutWidgetDndData
        | undefined;

      clearWidgetDropTarget();

      if (
        !event.canceled &&
        sourceData?.type === 'widget' &&
        isDefined(targetData)
      ) {
        const { widgetId, tabId: sourceTabId, index: sourceIndex } = sourceData;

        if (targetData.type === 'tab-widget-drop') {
          const destinationTabId = targetData.tabId;

          store.set(pageLayoutDraftState, (prev) =>
            moveWidgetToTabInDraft(prev, { widgetId, destinationTabId }),
          );
        } else if (targetData.type === 'widget-list') {
          const destinationTabId = targetData.tabId;

          store.set(pageLayoutDraftState, (prev) => {
            if (destinationTabId !== sourceTabId) {
              return moveWidgetToTabInDraft(prev, {
                widgetId,
                destinationTabId,
              });
            }

            const tab = prev.tabs.find(
              (candidateTab) => candidateTab.id === sourceTabId,
            );

            if (!isDefined(tab)) {
              return prev;
            }

            return moveWidgetWithinTabInDraft(prev, {
              tabId: sourceTabId,
              fromIndex: sourceIndex,
              toIndex: tab.widgets.length - 1,
            });
          });
        } else if (targetData.type === 'widget') {
          const destinationTabId = targetData.tabId;

          const resolvedDrop = resolveDropFromPointer({
            target: event.operation.target,
            pointer: event.operation.position.current,
            getDroppableItemCount: () => 0,
          });

          if (isDefined(resolvedDrop)) {
            const destinationIndex = getDestinationIndex({
              dropTargetIndex: resolvedDrop.dropTargetIndex,
              sourceIndex,
              sourceDroppableId: sourceTabId,
              destinationDroppableId: destinationTabId,
            });

            store.set(pageLayoutDraftState, (prev) =>
              destinationTabId === sourceTabId
                ? moveWidgetWithinTabInDraft(prev, {
                    tabId: sourceTabId,
                    fromIndex: sourceIndex,
                    toIndex: destinationIndex,
                  })
                : moveWidgetToTabInDraft(prev, {
                    widgetId,
                    destinationTabId,
                    destinationIndex,
                  }),
            );
          }
        }
      }

      if (
        !event.canceled &&
        sourceData?.type === 'tab' &&
        isDefined(targetData)
      ) {
        const draggedTabId = sourceData.tabId;

        const beforeTabId = resolveBeforeTabId(event, targetData);

        if (beforeTabId !== undefined) {
          store.set(pageLayoutDraftState, (prev) =>
            reorderTabInDraft(prev, { tabId: draggedTabId, beforeTabId }),
          );
        }
      }

      setPageLayoutDraggingWidgetId(null);
    },
    [
      store,
      pageLayoutDraftState,
      setPageLayoutDraggingWidgetId,
      clearWidgetDropTarget,
    ],
  );

  const contextValues: DragDropInsertionContextValues = {
    activeDropTargetIndex,
    activeDroppableId,
  };

  return { contextValues, handlers: { onDragStart, onDragMove, onDragEnd } };
};
