import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { getWidgetLayoutBehavior } from '@/page-layout/widgets/utils/getWidgetLayoutBehavior';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const useCanMovePageLayoutWidgetDown = (
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

  const canMovePageLayoutWidgetDown = useCallback(
    (widgetId: string) => {
      const draft = store.get(pageLayoutDraftState);

      const tab = draft.tabs.find((candidateTab) =>
        candidateTab.widgets.some((widget) => widget.id === widgetId),
      );

      if (!tab || tab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST) {
        return false;
      }

      const widget = tab.widgets.find(
        (candidateWidget) => candidateWidget.id === widgetId,
      );

      if (!widget || getWidgetLayoutBehavior(widget.type) === 'TAB_VIEWPORT') {
        return false;
      }

      const sortedWidgets = sortWidgetsByVerticalListPosition(tab.widgets);

      const widgetIndex = sortedWidgets.findIndex(
        (widget) => widget.id === widgetId,
      );

      return (
        widgetIndex >= 0 &&
        sortedWidgets
          .slice(widgetIndex + 1)
          .some(
            (candidateWidget) =>
              getWidgetLayoutBehavior(candidateWidget.type) === 'EXPANDABLE',
          )
      );
    },
    [pageLayoutDraftState, store],
  );

  return { canMovePageLayoutWidgetDown };
};
