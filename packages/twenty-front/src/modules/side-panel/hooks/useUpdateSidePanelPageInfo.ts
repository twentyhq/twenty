import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
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
      const sidePanelPageInfo = store.get(sidePanelPageInfoState.atom);

      const newSidePanelPageInfo = {
        ...sidePanelPageInfo,
        title: pageTitle ?? sidePanelPageInfo.title ?? '',
        Icon: pageIcon ?? sidePanelPageInfo.Icon ?? IconDotsVertical,
      };

      store.set(sidePanelPageInfoState.atom, newSidePanelPageInfo);

      const sidePanelNavigationStack = store.get(
        sidePanelNavigationStackState.atom,
      );

      const lastSidePanelNavigationStackItem = sidePanelNavigationStack.at(-1);

      if (!lastSidePanelNavigationStackItem) {
        return;
      }

      const newSidePanelNavigationStack = [
        ...sidePanelNavigationStack.slice(0, -1),
        {
          page: lastSidePanelNavigationStackItem.page,
          pageTitle: newSidePanelPageInfo.title,
          pageIcon: newSidePanelPageInfo.Icon,
          pageId: lastSidePanelNavigationStackItem.pageId,
        },
      ];

      store.set(
        sidePanelNavigationStackState.atom,
        newSidePanelNavigationStack,
      );
    },
    [store],
  );

  return {
    updateSidePanelPageInfo,
  };
};
