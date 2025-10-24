import { useRecoilCallback } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const useCommandMenuHistory = () => {
  const { closeCommandMenu } = useCommandMenu();

  const goBackFromCommandMenu = useRecoilCallback(
    ({ snapshot, set }) => {
      return () => {
        const currentNavigationStack = snapshot
          .getLoadable(commandMenuNavigationStackState)
          .getValue();

        const newNavigationStack = currentNavigationStack.slice(0, -1);
        const lastNavigationStackItem = newNavigationStack.at(-1);

        if (!isDefined(lastNavigationStackItem)) {
          closeCommandMenu();
          return;
        }

        set(commandMenuPageState, lastNavigationStackItem.page);

        set(commandMenuPageInfoState, {
          title: lastNavigationStackItem.pageTitle,
          Icon: lastNavigationStackItem.pageIcon,
          instanceId: lastNavigationStackItem.pageId,
        });

        set(commandMenuNavigationStackState, newNavigationStack);

        const currentMorphItems = snapshot
          .getLoadable(commandMenuNavigationMorphItemsByPageState)
          .getValue();

        if (currentNavigationStack.length > 0) {
          const removedItem = currentNavigationStack.at(-1);

          if (isDefined(removedItem)) {
            const newMorphItems = new Map(currentMorphItems);
            newMorphItems.delete(removedItem.pageId);
            set(commandMenuNavigationMorphItemsByPageState, newMorphItems);

            const morphItems = currentMorphItems.get(removedItem.pageId);
            if (isNonEmptyArray(morphItems)) {
              set(
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

        set(hasUserSelectedCommandState, false);
      };
    },
    [closeCommandMenu],
  );

  const navigateCommandMenuHistory = useRecoilCallback(({ snapshot, set }) => {
    return (pageIndex: number) => {
      const currentNavigationStack = snapshot
        .getLoadable(commandMenuNavigationStackState)
        .getValue();

      const newNavigationStack = currentNavigationStack.slice(0, pageIndex + 1);

      set(commandMenuNavigationStackState, newNavigationStack);

      const newNavigationStackItem = newNavigationStack.at(-1);

      if (!isDefined(newNavigationStackItem)) {
        throw new Error(
          `No command menu navigation stack item found for index ${pageIndex}`,
        );
      }

      set(commandMenuPageState, newNavigationStackItem.page);
      set(commandMenuPageInfoState, {
        title: newNavigationStackItem.pageTitle,
        Icon: newNavigationStackItem.pageIcon,
        instanceId: newNavigationStackItem.pageId,
      });
      const currentMorphItems = snapshot
        .getLoadable(commandMenuNavigationMorphItemsByPageState)
        .getValue();

      for (const [pageId, morphItems] of currentMorphItems.entries()) {
        if (!newNavigationStack.some((item) => item.pageId === pageId)) {
          set(
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

      set(commandMenuNavigationMorphItemsByPageState, newMorphItems);

      set(hasUserSelectedCommandState, false);
    };
  }, []);

  return {
    goBackFromCommandMenu,
    navigateCommandMenuHistory,
  };
};
