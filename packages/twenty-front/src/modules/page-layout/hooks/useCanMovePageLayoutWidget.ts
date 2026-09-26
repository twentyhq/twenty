import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getWidgetMoveWithinTab } from '@/page-layout/utils/getWidgetMoveWithinTab';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const useCanMovePageLayoutWidget = (pageLayoutIdFromProps?: string) => {
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

  const canMovePageLayoutWidget = useCallback(
    (widgetId: string, direction: 'up' | 'down') => {
      const draft = store.get(pageLayoutDraftState);

      const tab = draft.tabs.find((candidateTab) =>
        candidateTab.widgets.some((widget) => widget.id === widgetId),
      );

      if (!tab || tab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST) {
        return false;
      }

      return isDefined(
        getWidgetMoveWithinTab({
          widgets: tab.widgets,
          widgetId,
          direction,
          featureFlags,
        }),
      );
    },
    [featureFlags, pageLayoutDraftState, store],
  );

  return { canMovePageLayoutWidget };
};
