import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getWidgetMoveWithinTab } from '@/page-layout/utils/getWidgetMoveWithinTab';
import { moveWidgetWithinTabInDraft } from '@/page-layout/utils/moveWidgetWithinTabInDraft';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useMovePageLayoutWidget = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const featureFlags = useWorkspaceFeatureFlagsMap();

  const movePageLayoutWidget = useCallback(
    (widgetId: string, direction: 'up' | 'down') => {
      store.set(pageLayoutDraftState, (prev) => {
        const tab = prev.tabs.find((candidateTab) =>
          candidateTab.widgets.some((widget) => widget.id === widgetId),
        );

        if (!tab) {
          return prev;
        }

        const widgetMove = getWidgetMoveWithinTab({
          widgets: tab.widgets,
          widgetId,
          direction,
          featureFlags,
        });

        if (!isDefined(widgetMove)) {
          return prev;
        }

        return moveWidgetWithinTabInDraft(prev, {
          tabId: tab.id,
          ...widgetMove,
        });
      });
    },
    [featureFlags, pageLayoutDraftState, store],
  );

  return { movePageLayoutWidget };
};
