import { sidePanelNavigationStackState } from '@/command-menu/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/command-menu/states/sidePanelPageInfoState';
import { useCallback } from 'react';
import { type IconComponent, IconDotsVertical } from 'twenty-ui/display';
import { useStore } from 'jotai';

export const useUpdateSidePanelPageInfo = () => {
  const store = useStore();
  const updateSidePanelPageInfo = useCallback(
    ({
      pageTitle,
      pageIcon,
    }: {
      pageTitle?: string;
      pageIcon?: IconComponent;
    }) => {
      const commandMenuPageInfo = store.get(sidePanelPageInfoState.atom);

      const newSidePanelPageInfo = {
        ...commandMenuPageInfo,
        title: pageTitle ?? commandMenuPageInfo.title ?? '',
        Icon: pageIcon ?? commandMenuPageInfo.Icon ?? IconDotsVertical,
      };

      store.set(sidePanelPageInfoState.atom, newSidePanelPageInfo);

      const commandMenuNavigationStack = store.get(
        sidePanelNavigationStackState.atom,
      );

      const lastSidePanelNavigationStackItem =
        commandMenuNavigationStack.at(-1);

      if (!lastSidePanelNavigationStackItem) {
        return;
      }

      const newCommandMenuNavigationStack = [
        ...commandMenuNavigationStack.slice(0, -1),
        {
          page: lastSidePanelNavigationStackItem.page,
          pageTitle: newSidePanelPageInfo.title,
          pageIcon: newSidePanelPageInfo.Icon,
          pageId: lastSidePanelNavigationStackItem.pageId,
        },
      ];

      store.set(
        sidePanelNavigationStackState.atom,
        newCommandMenuNavigationStack,
      );
    },
    [store],
  );

  return {
    updateSidePanelPageInfo,
  };
};
