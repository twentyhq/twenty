import { type DragDropProvider } from '@dnd-kit/react';
import { useStore } from 'jotai';
import { type ComponentProps, useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { type PageLayoutWidgetDndData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { moveWidgetToTabInDraft } from '@/page-layout/utils/moveWidgetToTabInDraft';
import { moveWidgetWithinTabInDraft } from '@/page-layout/utils/moveWidgetWithinTabInDraft';
import { getDestinationIndex } from '@/ui/utilities/drag-and-drop/utils/getDestinationIndex';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

type Provider = typeof DragDropProvider<PageLayoutWidgetDndData>;
type DragStartEvent = Parameters<
  NonNullable<ComponentProps<Provider>['onDragStart']>
>[0];
type DragEndEvent = Parameters<
  NonNullable<ComponentProps<Provider>['onDragEnd']>
>[0];

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

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const sourceData = event.operation.source?.data as
        | PageLayoutWidgetDndData
        | undefined;

      if (sourceData?.type === 'widget') {
        setPageLayoutDraggingWidgetId(sourceData.widgetId);
      }
    },
    [setPageLayoutDraggingWidgetId],
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const sourceData = event.operation.source?.data as
        | PageLayoutWidgetDndData
        | undefined;
      const targetData = event.operation.target?.data as
        | PageLayoutWidgetDndData
        | undefined;

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
          // The drop line renders above the hovered widget, so the drop targets
          // the slot before it; getDestinationIndex compensates for the source
          // removal shifting same-tab downward moves by one.
          const destinationTabId = targetData.tabId;
          const destinationIndex = getDestinationIndex({
            dropTargetIndex: targetData.index,
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

      setPageLayoutDraggingWidgetId(null);
    },
    [store, pageLayoutDraftState, setPageLayoutDraggingWidgetId],
  );

  return { handlers: { onDragStart, onDragEnd } };
};
