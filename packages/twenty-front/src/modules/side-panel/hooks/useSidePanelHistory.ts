import { useCallback } from 'react';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { releaseRemovedRoutedFlowStateScopes } from '@/side-panel/routing/utils/releaseRemovedRoutedFlowStateScopes';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelSubPageStackComponentState } from '@/side-panel/states/sidePanelSubPageStackComponentState';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { isNonEmptyArray } from '@sniptt/guards';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useSidePanelHistory = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const cleanupCurrentPage = useCallback(() => {
    const currentNavigationStack = store.get(
      sidePanelNavigationStackState.atom,
    );

    const currentMorphItems = store.get(
      sidePanelNavigationMorphItemsByPageState.atom,
    );

    if (currentNavigationStack.length > 0) {
      const removedItem = currentNavigationStack.at(-1);

      if (isDefined(removedItem)) {
        const newMorphItems = new Map(currentMorphItems);
        newMorphItems.delete(removedItem.pageId);
        store.set(sidePanelNavigationMorphItemsByPageState.atom, newMorphItems);

        store.set(
          sidePanelSubPageStackComponentState.atomFamily({
            instanceId: removedItem.pageId,
            surfaceId,
          }),
          [],
        );

        const morphItems = currentMorphItems.get(removedItem.pageId);
        if (isNonEmptyArray(morphItems)) {
          store.set(
            activeTabIdComponentState.atomFamily({
              instanceId: getShowPageTabListComponentId({
                pageId: removedItem.pageId,
                targetObjectId: morphItems[0].recordId,
              }),
              surfaceId,
            }),
            null,
          );
        }
      }
    }
  }, [store, surfaceId]);

  const goBackFromSidePanel = useCallback(() => {
    const currentNavigationStack = store.get(
      sidePanelNavigationStackState.atom,
    );

    const newNavigationStack = currentNavigationStack.slice(0, -1);

    if (newNavigationStack.length === 0) {
      closeSidePanelMenu();
      return;
    }

    cleanupCurrentPage();
    store.set(sidePanelNavigationStackState.atom, newNavigationStack);
    releaseRemovedRoutedFlowStateScopes({
      removedItems: currentNavigationStack.slice(-1),
      remainingItems: newNavigationStack,
    });

    store.set(hasUserSelectedSidePanelListItemState.atom, false);
  }, [cleanupCurrentPage, closeSidePanelMenu, store]);

  const goBackOneSubPageOrMainPage = useCallback(() => {
    const currentNavigationItem = store
      .get(sidePanelNavigationStackState.atom)
      .at(-1);

    if (!isDefined(currentNavigationItem)) {
      goBackFromSidePanel();
      return;
    }

    const subPageStack = store.get(
      sidePanelSubPageStackComponentState.atomFamily({
        instanceId: currentNavigationItem.pageId,
        surfaceId,
      }),
    );

    if (isNonEmptyArray(subPageStack)) {
      store.set(
        sidePanelSubPageStackComponentState.atomFamily({
          instanceId: currentNavigationItem.pageId,
          surfaceId,
        }),
        subPageStack.slice(0, -1),
      );
      return;
    }

    goBackFromSidePanel();
  }, [goBackFromSidePanel, store, surfaceId]);

  const navigateSidePanelHistory = useCallback(
    (pageIndex: number) => {
      const currentNavigationStack = store.get(
        sidePanelNavigationStackState.atom,
      );

      const newNavigationStack = currentNavigationStack.slice(0, pageIndex + 1);
      const removedNavigationItems = currentNavigationStack.slice(
        pageIndex + 1,
      );

      store.set(sidePanelNavigationStackState.atom, newNavigationStack);
      releaseRemovedRoutedFlowStateScopes({
        removedItems: removedNavigationItems,
        remainingItems: newNavigationStack,
      });

      const newNavigationStackItem = newNavigationStack.at(-1);

      if (!isDefined(newNavigationStackItem)) {
        throw new Error(
          `No side panel navigation stack item found for index ${pageIndex}`,
        );
      }

      const currentMorphItems = store.get(
        sidePanelNavigationMorphItemsByPageState.atom,
      );

      for (const [pageId, morphItems] of currentMorphItems.entries()) {
        if (!newNavigationStack.some((item) => item.pageId === pageId)) {
          store.set(
            sidePanelSubPageStackComponentState.atomFamily({
              instanceId: pageId,
              surfaceId,
            }),
            [],
          );

          store.set(
            activeTabIdComponentState.atomFamily({
              instanceId: getShowPageTabListComponentId({
                pageId,
                targetObjectId: morphItems[0].recordId,
              }),
              surfaceId,
            }),
            null,
          );
        }
      }

      const newMorphItems = new Map(
        Array.from(currentMorphItems.entries()).filter(([pageId]) =>
          newNavigationStack.some((item) => item.pageId === pageId),
        ),
      );

      store.set(sidePanelNavigationMorphItemsByPageState.atom, newMorphItems);

      store.set(hasUserSelectedSidePanelListItemState.atom, false);
    },
    [store, surfaceId],
  );

  return {
    goBackFromSidePanel,
    goBackOneSubPageOrMainPage,
    navigateSidePanelHistory,
  };
};
