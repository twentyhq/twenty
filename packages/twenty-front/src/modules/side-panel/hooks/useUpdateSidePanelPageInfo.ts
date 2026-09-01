import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useCallback, useEffect } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
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
          pageTitle: pageTitle ?? lastSidePanelNavigationStackItem.pageTitle,
          pageIcon: pageIcon ?? lastSidePanelNavigationStackItem.pageIcon,
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

export const useSyncSidePanelPageTitle = (pageTitle?: string) => {
  const workspaceSurface = useWorkspaceSurface();
  const { updateSidePanelPageInfo } = useUpdateSidePanelPageInfo();

  useEffect(() => {
    if (workspaceSurface.type === 'side-panel' && pageTitle !== undefined) {
      updateSidePanelPageInfo({ pageTitle });
    }
  }, [pageTitle, updateSidePanelPageInfo, workspaceSurface.type]);
};
