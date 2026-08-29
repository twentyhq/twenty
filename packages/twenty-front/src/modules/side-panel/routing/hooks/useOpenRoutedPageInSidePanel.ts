import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { isSidePanelHostablePath } from '@/side-panel/routing/utils/isSidePanelHostablePath';
import { resolveSidePanelRoutedPageInfo } from '@/side-panel/routing/utils/resolveSidePanelRoutedPageInfo';

export const useOpenRoutedPageInSidePanel = () => {
  const store = useStore();
  const { getIcon } = useIcons();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openRoutedPageInSidePanel = useCallback(
    ({ path }: { path: string }) => {
      if (!isSidePanelHostablePath(path)) {
        return;
      }

      const { title, iconKey, iconColor } = resolveSidePanelRoutedPageInfo({
        path,
        store,
      });

      const pageComponentInstanceId = v4();

      store.set(
        sidePanelRoutedPagePathComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        path,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.RoutedPage,
        pageTitle: title,
        pageIcon: getIcon(iconKey),
        pageIconColor: iconColor,
        pageId: pageComponentInstanceId,
      });
    },
    [store, getIcon, navigateSidePanelMenu],
  );

  return { openRoutedPageInSidePanel };
};
