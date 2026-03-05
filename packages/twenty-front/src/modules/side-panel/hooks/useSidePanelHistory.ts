import { useCallback } from 'react';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useSidePanelHistory = () => {
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const goBackFromSidePanel = useCallback(() => {
    const currentNavigationStack = store.get(
      sidePanelNavigationStackState.atom,
    );

    const newNavigationStack = currentNavigationStack.slice(0, -1);
    const lastNavigationStackItem = newNavigationStack.at(-1);

    if (!isDefined(lastNavigationStackItem)) {
      closeSidePanelMenu();
      return;
    }

    store.set(sidePanelPageState.atom, lastNavigationStackItem.page);

    store.set(sidePanelPageInfoState.atom, {
      title: lastNavigationStackItem.pageTitle,
      Icon: lastNavigationStackItem.pageIcon,
      instanceId: lastNavigationStackItem.pageId,
    });

    store.set(sidePanelNavigationStackState.atom, newNavigationStack);

    const currentMorphItems = store.get(
      sidePanelNavigationMorphItemsByPageState.atom,
    );

    if (currentNavigationStack.length > 0) {
      const removedItem = currentNavigationStack.at(-1);

      if (isDefined(removedItem)) {
        const newMorphItems = new Map(currentMorphItems);
        newMorphItems.delete(removedItem.pageId);
        store.set(sidePanelNavigationMorphItemsByPageState.atom, newMorphItems);

        const morphItems = currentMorphItems.get(removedItem.pageId);
        if (isNonEmptyArray(morphItems)) {
          store.set(
            activeTabIdComponentState.atomFamily({
              instanceId: getShowPageTabListComponentId({
                pageId: removedItem.pageId,
                targetObjectId: morphItems[0].recordId,
              }),
            }),
            null,
          );
        }
      }
    }

    store.set(hasUserSelectedSidePanelListItemState.atom, false);
  }, [closeSidePanelMenu, store]);

  const navigateSidePanelHistory = useCallback(
    (pageIndex: number) => {
      const currentNavigationStack = store.get(
        sidePanelNavigationStackState.atom,
      );

      const newNavigationStack = currentNavigationStack.slice(0, pageIndex + 1);

      store.set(sidePanelNavigationStackState.atom, newNavigationStack);

      const newNavigationStackItem = newNavigationStack.at(-1);

      if (!isDefined(newNavigationStackItem)) {
        throw new Error(
          `No side panel navigation stack item found for index ${pageIndex}`,
        );
      }

      store.set(sidePanelPageState.atom, newNavigationStackItem.page);
      store.set(sidePanelPageInfoState.atom, {
        title: newNavigationStackItem.pageTitle,
        Icon: newNavigationStackItem.pageIcon,
        instanceId: newNavigationStackItem.pageId,
      });
      const currentMorphItems = store.get(
        sidePanelNavigationMorphItemsByPageState.atom,
      );

      for (const [pageId, morphItems] of currentMorphItems.entries()) {
        if (!newNavigationStack.some((item) => item.pageId === pageId)) {
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
    navigateSidePanelHistory,
  };
};
