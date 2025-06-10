import { useRecoilCallback } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
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
          .getLoadable(commandMenuNavigationMorphItemByPageState)
          .getValue();

        if (currentNavigationStack.length > 0) {
          const removedItem = currentNavigationStack.at(-1);

          if (isDefined(removedItem)) {
            const newMorphItems = new Map(currentMorphItems);
            newMorphItems.delete(removedItem.pageId);
            set(commandMenuNavigationMorphItemByPageState, newMorphItems);

            const morphItem = currentMorphItems.get(removedItem.pageId);
            if (isDefined(morphItem)) {
              set(
                activeTabIdComponentState.atomFamily({
                  instanceId: getShowPageTabListComponentId({
                    pageId: removedItem.pageId,
                    targetObjectId: morphItem.recordId,
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
        .getLoadable(commandMenuNavigationMorphItemByPageState)
        .getValue();

      for (const [pageId, morphItem] of currentMorphItems.entries()) {
        if (!newNavigationStack.some((item) => item.pageId === pageId)) {
          set(
            activeTabIdComponentState.atomFamily({
              instanceId: getShowPageTabListComponentId({
                pageId,
                targetObjectId: morphItem.recordId,
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

      set(commandMenuNavigationMorphItemByPageState, newMorphItems);

      set(hasUserSelectedCommandState, false);
    };
  }, []);

  return {
    goBackFromCommandMenu,
    navigateCommandMenuHistory,
  };
};
