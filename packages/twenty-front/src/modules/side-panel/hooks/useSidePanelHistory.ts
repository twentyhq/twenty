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

export const useSidePanelHistory = () => {
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const cleanupPage = useCallback(
    (pageId: string) => {
      const currentMorphItems = store.get(
        sidePanelNavigationMorphItemsByPageState.atom,
      );

      const newMorphItems = new Map(currentMorphItems);
      newMorphItems.delete(pageId);
      store.set(sidePanelNavigationMorphItemsByPageState.atom, newMorphItems);

      store.set(
        sidePanelSubPageStackComponentState.atomFamily({ instanceId: pageId }),
        [],
      );

      const morphItems = currentMorphItems.get(pageId);
      if (isNonEmptyArray(morphItems)) {
        store.set(
          activeTabIdComponentState.atomFamily({
            instanceId: getShowPageTabListComponentId({
              pageId,
              targetObjectId: morphItems[0].recordId,
            }),
          }),
          null,
        );
      }
    },
    [store],
  );

  const cleanupCurrentPage = useCallback(() => {
    const removedItem = store.get(sidePanelNavigationStackState.atom).at(-1);

    if (isDefined(removedItem)) {
      cleanupPage(removedItem.pageId);
    }
  }, [cleanupPage, store]);

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

  const removePageFromSidePanelHistory = useCallback(
    (pageId: string) => {
      const currentNavigationStack = store.get(
        sidePanelNavigationStackState.atom,
      );

      if (currentNavigationStack.at(-1)?.pageId === pageId) {
        goBackFromSidePanel();
        return;
      }

      const removedItems = currentNavigationStack.filter(
        (item) => item.pageId === pageId,
      );

      if (!isNonEmptyArray(removedItems)) {
        return;
      }

      const remainingItems = currentNavigationStack.filter(
        (item) => item.pageId !== pageId,
      );

      cleanupPage(pageId);
      store.set(sidePanelNavigationStackState.atom, remainingItems);
      releaseRemovedRoutedFlowStateScopes({ removedItems, remainingItems });
    },
    [cleanupPage, goBackFromSidePanel, store],
  );

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
      }),
    );

    if (isNonEmptyArray(subPageStack)) {
      store.set(
        sidePanelSubPageStackComponentState.atomFamily({
          instanceId: currentNavigationItem.pageId,
        }),
        subPageStack.slice(0, -1),
      );
      return;
    }

    goBackFromSidePanel();
  }, [goBackFromSidePanel, store]);

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
            }),
            [],
          );

          store.set(
            activeTabIdComponentState.atomFamily({
              instanceId: getShowPageTabListComponentId({
                pageId,
                targetObjectId: morphItems[0].recordId,
              }),
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
    [store],
  );

  return {
    goBackFromSidePanel,
    goBackOneSubPageOrMainPage,
    navigateSidePanelHistory,
    removePageFromSidePanelHistory,
  };
};
