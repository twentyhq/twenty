import { useCallback } from 'react';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuHistory = () => {
  const { closeCommandMenu } = useCommandMenu();

  const goBackFromCommandMenu = useCallback(() => {
    const currentNavigationStack = jotaiStore.get(
      commandMenuNavigationStackState.atom,
    );

    const newNavigationStack = currentNavigationStack.slice(0, -1);
    const lastNavigationStackItem = newNavigationStack.at(-1);

    if (!isDefined(lastNavigationStackItem)) {
      closeCommandMenu();
      return;
    }

    jotaiStore.set(commandMenuPageState.atom, lastNavigationStackItem.page);

    jotaiStore.set(commandMenuPageInfoState.atom, {
      title: lastNavigationStackItem.pageTitle,
      Icon: lastNavigationStackItem.pageIcon,
      instanceId: lastNavigationStackItem.pageId,
    });

    jotaiStore.set(commandMenuNavigationStackState.atom, newNavigationStack);

    const currentMorphItems = jotaiStore.get(
      commandMenuNavigationMorphItemsByPageState.atom,
    );

    if (currentNavigationStack.length > 0) {
      const removedItem = currentNavigationStack.at(-1);

      if (isDefined(removedItem)) {
        const newMorphItems = new Map(currentMorphItems);
        newMorphItems.delete(removedItem.pageId);
        jotaiStore.set(
          commandMenuNavigationMorphItemsByPageState.atom,
          newMorphItems,
        );

        const morphItems = currentMorphItems.get(removedItem.pageId);
        if (isNonEmptyArray(morphItems)) {
          jotaiStore.set(
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

    jotaiStore.set(hasUserSelectedCommandState.atom, false);
  }, [closeCommandMenu]);

  const navigateCommandMenuHistory = useCallback((pageIndex: number) => {
    const currentNavigationStack = jotaiStore.get(
      commandMenuNavigationStackState.atom,
    );

    const newNavigationStack = currentNavigationStack.slice(0, pageIndex + 1);

    jotaiStore.set(commandMenuNavigationStackState.atom, newNavigationStack);

    const newNavigationStackItem = newNavigationStack.at(-1);

    if (!isDefined(newNavigationStackItem)) {
      throw new Error(
        `No command menu navigation stack item found for index ${pageIndex}`,
      );
    }

    jotaiStore.set(commandMenuPageState.atom, newNavigationStackItem.page);
    jotaiStore.set(commandMenuPageInfoState.atom, {
      title: newNavigationStackItem.pageTitle,
      Icon: newNavigationStackItem.pageIcon,
      instanceId: newNavigationStackItem.pageId,
    });
    const currentMorphItems = jotaiStore.get(
      commandMenuNavigationMorphItemsByPageState.atom,
    );

    for (const [pageId, morphItems] of currentMorphItems.entries()) {
      if (!newNavigationStack.some((item) => item.pageId === pageId)) {
        jotaiStore.set(
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

    jotaiStore.set(
      commandMenuNavigationMorphItemsByPageState.atom,
      newMorphItems,
    );

    jotaiStore.set(hasUserSelectedCommandState.atom, false);
  }, []);

  return {
    goBackFromCommandMenu,
    navigateCommandMenuHistory,
  };
};
