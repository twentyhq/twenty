import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getAdjacentFitContentWidgetIndex } from '@/page-layout/utils/getAdjacentFitContentWidgetIndex';
import { moveWidgetWithinTabInDraft } from '@/page-layout/utils/moveWidgetWithinTabInDraft';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
        const targetIndex = getAdjacentFitContentWidgetIndex({
          widgets: sortedWidgets,
          widgetIndex: currentIndex,
          direction: 'up',
        });

        if (!isDefined(targetIndex)) {
          return prev;
        }

        return moveWidgetWithinTabInDraft(prev, {
          tabId: tab.id,
          fromIndex: currentIndex,
          toIndex: targetIndex,
        });
      });
    },
    [pageLayoutDraftState, store],
  );

  return { movePageLayoutWidgetUp };
};
