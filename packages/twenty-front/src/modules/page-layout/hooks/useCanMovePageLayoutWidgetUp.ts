import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const useCanMovePageLayoutWidgetUp = (
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

  const canMovePageLayoutWidgetUp = useCallback(
    (widgetId: string) => {
      const draft = store.get(pageLayoutDraftState);

      const tab = draft.tabs.find((candidateTab) =>
        candidateTab.widgets.some((widget) => widget.id === widgetId),
      );

      if (!tab || tab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST) {
        return false;
      }

      const sortedWidgets = sortWidgetsByVerticalListPosition(tab.widgets);

      const widgetIndex = sortedWidgets.findIndex(
        (widget) => widget.id === widgetId,
      );

      return widgetIndex > 0;
    },
    [pageLayoutDraftState, store],
  );

  return { canMovePageLayoutWidgetUp };
};
