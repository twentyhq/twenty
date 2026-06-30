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

export const useMovePageLayoutWidgetUp = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const movePageLayoutWidgetUp = useCallback(
    (widgetId: string) => {
      store.set(pageLayoutDraftState, (prev) => {
        const tab = prev.tabs.find((candidateTab) =>
          candidateTab.widgets.some((widget) => widget.id === widgetId),
        );

        if (!tab) {
          return prev;
        }

        const sortedWidgets = sortWidgetsByVerticalListPosition(tab.widgets);

        const currentIndex = sortedWidgets.findIndex(
          (widget) => widget.id === widgetId,
        );

        if (currentIndex <= 0) {
          return prev;
        }

        const currentWidget = sortedWidgets[currentIndex];
        const neighborWidget = sortedWidgets[currentIndex - 1];

        const currentPositionIndex =
          isDefined(currentWidget.position) &&
          isVerticalListPosition(currentWidget.position)
            ? currentWidget.position.index
            : currentIndex;
        const neighborPositionIndex =
          isDefined(neighborWidget.position) &&
          isVerticalListPosition(neighborWidget.position)
            ? neighborWidget.position.index
            : currentIndex - 1;

        return {
          ...prev,
          tabs: prev.tabs.map((currentTab) => {
            if (currentTab.id !== tab.id) {
              return currentTab;
            }
            return {
              ...currentTab,
              widgets: currentTab.widgets.map((widget) => {
                if (widget.id === currentWidget.id) {
                  return {
                    ...widget,
                    position: {
                      __typename:
                        'PageLayoutWidgetVerticalListPosition' as const,
                      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                      index: neighborPositionIndex,
                    },
                  };
                }
                if (widget.id === neighborWidget.id) {
                  return {
                    ...widget,
                    position: {
                      __typename:
                        'PageLayoutWidgetVerticalListPosition' as const,
                      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                      index: currentPositionIndex,
                    },
                  };
                }
                return widget;
              }),
            };
          }),
        };
      });
    },
    [pageLayoutDraftState, store],
  );

  return { movePageLayoutWidgetUp };
};
