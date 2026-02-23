import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';
import { type IconComponent, IconDotsVertical } from 'twenty-ui/display';

export const useUpdateCommandMenuPageInfo = () => {
  const updateCommandMenuPageInfo = useCallback(
    ({
      pageTitle,
      pageIcon,
    }: {
      pageTitle?: string;
      pageIcon?: IconComponent;
    }) => {
      const commandMenuPageInfo = jotaiStore.get(commandMenuPageInfoState.atom);

      const newCommandMenuPageInfo = {
        ...commandMenuPageInfo,
        title: pageTitle ?? commandMenuPageInfo.title ?? '',
        Icon: pageIcon ?? commandMenuPageInfo.Icon ?? IconDotsVertical,
      };

      jotaiStore.set(commandMenuPageInfoState.atom, newCommandMenuPageInfo);

      const commandMenuNavigationStack = jotaiStore.get(
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

      jotaiStore.set(
        commandMenuNavigationStackState.atom,
        newCommandMenuNavigationStack,
      );
    },
    [],
  );

  return {
    updateCommandMenuPageInfo,
  };
};
