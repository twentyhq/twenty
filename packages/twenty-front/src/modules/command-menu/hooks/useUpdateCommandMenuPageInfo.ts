import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { useCallback } from 'react';
import { type IconComponent, IconDotsVertical } from 'twenty-ui/display';
import { useStore } from 'jotai';

export const useUpdateCommandMenuPageInfo = () => {
  const store = useStore();
  const updateCommandMenuPageInfo = useCallback(
    ({
      pageTitle,
      pageIcon,
    }: {
      pageTitle?: string;
      pageIcon?: IconComponent;
    }) => {
      const commandMenuPageInfo = store.get(commandMenuPageInfoState.atom);

      const newCommandMenuPageInfo = {
        ...commandMenuPageInfo,
        title: pageTitle ?? commandMenuPageInfo.title ?? '',
        Icon: pageIcon ?? commandMenuPageInfo.Icon ?? IconDotsVertical,
      };

      store.set(commandMenuPageInfoState.atom, newCommandMenuPageInfo);

      const commandMenuNavigationStack = store.get(
        commandMenuNavigationStackState.atom,
      );

      const lastCommandMenuNavigationStackItem =
        commandMenuNavigationStack.at(-1);

      if (!lastCommandMenuNavigationStackItem) {
        return;
      }

      const newCommandMenuNavigationStack = [
        ...commandMenuNavigationStack.slice(0, -1),
        {
          page: lastCommandMenuNavigationStackItem.page,
          pageTitle: newCommandMenuPageInfo.title,
          pageIcon: newCommandMenuPageInfo.Icon,
          pageId: lastCommandMenuNavigationStackItem.pageId,
        },
      ];

      store.set(
        commandMenuNavigationStackState.atom,
        newCommandMenuNavigationStack,
      );
    },
    [store],
  );

  return {
    updateCommandMenuPageInfo,
  };
};
