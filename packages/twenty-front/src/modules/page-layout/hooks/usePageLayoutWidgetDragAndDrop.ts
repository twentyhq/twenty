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
      const target = event.operation.target as {
        group?: unknown;
        index?: unknown;
        data?: PageLayoutWidgetDndData;
      } | null;

      if (
        !event.canceled &&
        sourceData?.type === 'widget' &&
        isDefined(target)
      ) {
        const { widgetId, tabId: sourceTabId, index: sourceIndex } = sourceData;

        if (target.data?.type === 'tab-widget-drop') {
          const destinationTabId = target.data.tabId;

          if (destinationTabId !== sourceTabId) {
            store.set(pageLayoutDraftState, (prev) =>
              moveWidgetToTabInDraft(prev, { widgetId, destinationTabId }),
            );
          }
        } else if (isDefined(target.group)) {
          const destinationTabId = String(target.group);
          const destinationIndex = Number(target.index);

          if (Number.isInteger(destinationIndex)) {
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

      setPageLayoutDraggingWidgetId(null);
    },
    [store, pageLayoutDraftState, setPageLayoutDraggingWidgetId],
  );

  return { handlers: { onDragStart, onDragEnd } };
};
