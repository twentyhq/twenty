import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const useMoveWidgetToTab = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const moveWidgetToTab = useCallback(
    (widgetId: string, destinationTabId: string) => {
      store.set(pageLayoutDraftState, (prev) => {
        const sourceTab = prev.tabs.find((candidateTab) =>
          candidateTab.widgets.some((widget) => widget.id === widgetId),
        );

        if (!sourceTab) {
          return prev;
        }

        if (sourceTab.id === destinationTabId) {
          return prev;
        }

        const destinationTab = prev.tabs.find(
          (candidateTab) => candidateTab.id === destinationTabId,
        );

        if (!destinationTab) {
          return prev;
        }

        const widget = sourceTab.widgets.find(
          (candidateWidget) => candidateWidget.id === widgetId,
        );

        if (!widget) {
          return prev;
        }

        const movedWidget = {
          ...widget,
          pageLayoutTabId: destinationTabId,
          position: {
            __typename: 'PageLayoutWidgetVerticalListPosition' as const,
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: destinationTab.widgets.length,
          },
        };

        return {
          ...prev,
          tabs: prev.tabs.map((currentTab) => {
            if (currentTab.id === sourceTab.id) {
              const remainingWidgets = sortWidgetsByVerticalListPosition(
                currentTab.widgets,
              )
                .filter((tabWidget) => tabWidget.id !== widgetId)
                .map((tabWidget, widgetIndex) => ({
                  ...tabWidget,
                  position:
                    isDefined(tabWidget.position) &&
                    isVerticalListPosition(tabWidget.position)
                      ? {
                          __typename:
                            'PageLayoutWidgetVerticalListPosition' as const,
                          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                          index: widgetIndex,
                        }
                      : tabWidget.position,
                }));

              return {
                ...currentTab,
                widgets: remainingWidgets,
              };
            }
            if (currentTab.id === destinationTabId) {
              return {
                ...currentTab,
                widgets: [...currentTab.widgets, movedWidget],
              };
            }
            return currentTab;
          }),
        };
      });
    },
    [pageLayoutDraftState, store],
  );

  return { moveWidgetToTab };
};
