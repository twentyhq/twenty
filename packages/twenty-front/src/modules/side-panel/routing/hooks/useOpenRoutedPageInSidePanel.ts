import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useWorkspaceRouteObjects } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { isSidePanelRoutedLocation } from '@/side-panel/routing/utils/isSidePanelRoutedLocation';
import { toSidePanelLocation } from '@/side-panel/routing/utils/toSidePanelLocation';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { releaseRemovedRoutedFlowStateScopes } from '@/side-panel/routing/utils/releaseRemovedRoutedFlowStateScopes';

export const useOpenRoutedPageInSidePanel = () => {
  const store = useStore();
  const routeObjects = useWorkspaceRouteObjects();
  const { navigateSidePanel } = useNavigateSidePanel();

  const openRoutedPageInSidePanel = useCallback(
    ({
      path,
      state,
      pageTitle,
      resetNavigationStack = false,
      replaceCurrent = false,
      routedFlowStateScopeId,
    }: {
      path: string;
      state?: unknown;
      pageTitle?: string;
      resetNavigationStack?: boolean;
      replaceCurrent?: boolean;
      routedFlowStateScopeId?: string;
    }) => {
      if (!path.startsWith('/') || path.startsWith('//')) {
        return null;
      }

      let routedLocation = toSidePanelLocation(path, state);

      if (!isSidePanelRoutedLocation(routeObjects, routedLocation)) {
        return null;
      }

      const title = pageTitle ?? routedLocation.pathname;

      if (replaceCurrent) {
        const navigationStack = store.get(sidePanelNavigationStackState.atom);
        const currentItem = navigationStack.at(-1);

        if (
          !isDefined(currentItem) ||
          currentItem.page !== SidePanelPages.RoutedPage
        ) {
          return null;
        }

        routedLocation = {
          ...routedLocation,
          key: currentItem.routedLocation.key,
        };

        const updatedCurrentItem = {
          ...currentItem,
          pageTitle: title,
          routedLocation,
        };

        store.set(
          sidePanelNavigationStackState.atom,
          resetNavigationStack
            ? [updatedCurrentItem]
            : [...navigationStack.slice(0, -1), updatedCurrentItem],
        );
        if (resetNavigationStack) {
          releaseRemovedRoutedFlowStateScopes({
            removedItems: navigationStack.slice(0, -1),
            remainingItems: [updatedCurrentItem],
          });
        }
        return currentItem.pageId;
      }

      const pageComponentInstanceId = v4();

      navigateSidePanel({
        page: SidePanelPages.RoutedPage,
        pageTitle: title,
        pageIcon: IconDotsVertical,
        pageId: pageComponentInstanceId,
        routedFlowStateScopeId:
          routedFlowStateScopeId ?? pageComponentInstanceId,
        routedLocation,
        resetNavigationStack,
      });

      // The caller keys its own per-visit state off this, the way the morph
      // navigation stack does for a record.
      return pageComponentInstanceId;
    },
    [navigateSidePanel, routeObjects, store],
  );

  return { openRoutedPageInSidePanel };
};
