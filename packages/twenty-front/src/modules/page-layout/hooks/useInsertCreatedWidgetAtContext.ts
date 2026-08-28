import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { reindexWidgetsToVerticalListPositions } from '@/page-layout/utils/reindexWidgetsToVerticalListPositions';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useInsertCreatedWidgetAtContext = (
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

  const widgetInsertionContextState = useAtomComponentStateCallbackState(
    widgetInsertionContextComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const insertCreatedWidgetAtContext = useCallback(
    (newWidgetId: string) => {
      const insertionContext = store.get(widgetInsertionContextState);

      if (insertionContext === null) {
        return;
      }

      store.set(pageLayoutDraftState, (prev) => {
        const tab = prev.tabs.find((candidateTab) =>
          candidateTab.widgets.some(
            (widget) => widget.id === insertionContext.targetWidgetId,
          ),
        );

        if (!tab) {
          return prev;
        }

        const sortedWidgets = sortWidgetsByVerticalListPosition(tab.widgets);

        const targetIndex = sortedWidgets.findIndex(
          (widget) => widget.id === insertionContext.targetWidgetId,
        );

        if (targetIndex < 0) {
          return prev;
        }

        const insertAtIndex =
          insertionContext.direction === 'above'
            ? targetIndex
            : targetIndex + 1;

        const widgetsWithoutNew = sortedWidgets.filter(
          (widget) => widget.id !== newWidgetId,
        );

        const newWidget = tab.widgets.find(
          (widget) => widget.id === newWidgetId,
        );

        if (!newWidget) {
          return prev;
        }

        widgetsWithoutNew.splice(insertAtIndex, 0, newWidget);

        const reindexedWidgets =
          reindexWidgetsToVerticalListPositions(widgetsWithoutNew);

        return {
          ...prev,
          tabs: prev.tabs.map((currentTab) => {
            if (currentTab.id !== tab.id) {
              return currentTab;
            }
            return {
              ...currentTab,
              widgets: reindexedWidgets,
            };
          }),
        };
      });

      store.set(widgetInsertionContextState, null);
    },
    [pageLayoutDraftState, store, widgetInsertionContextState],
  );

  return { insertCreatedWidgetAtContext };
};
