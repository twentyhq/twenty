import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { moveWidgetWithinTabInDraft } from '@/page-layout/utils/moveWidgetWithinTabInDraft';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

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

        const currentIndex = sortWidgetsByVerticalListPosition(
          tab.widgets,
        ).findIndex((widget) => widget.id === widgetId);

        if (currentIndex <= 0) {
          return prev;
        }

        return moveWidgetWithinTabInDraft(prev, {
          tabId: tab.id,
          fromIndex: currentIndex,
          toIndex: currentIndex - 1,
        });
      });
    },
    [pageLayoutDraftState, store],
  );

  return { movePageLayoutWidgetUp };
};
