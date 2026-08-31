import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useCallback } from 'react';
import { type IconComponent, IconDotsVertical } from 'twenty-ui/icon';
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
          ...lastSidePanelNavigationStackItem,
          pageTitle:
            pageTitle ?? lastSidePanelNavigationStackItem.pageTitle ?? '',
          pageIcon:
            pageIcon ??
            lastSidePanelNavigationStackItem.pageIcon ??
            IconDotsVertical,
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
