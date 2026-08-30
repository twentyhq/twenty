import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { matchSidePanelHostableRoute } from '@/side-panel/routing/utils/matchSidePanelHostableRoute';
import { resolveSidePanelRoutedPageInfo } from '@/side-panel/routing/utils/resolveSidePanelRoutedPageInfo';

export const useOpenRoutedPageInSidePanel = () => {
  const store = useStore();
  const { getIcon } = useIcons();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openRoutedPageInSidePanel = useCallback(
    ({
      path,
      pageTitle,
      resetNavigationStack = false,
    }: {
      path: string;
      pageTitle?: string;
      resetNavigationStack?: boolean;
    }) => {
      const hostableRouteMatch = matchSidePanelHostableRoute(path);

      if (!isDefined(hostableRouteMatch)) {
        return null;
      }

      const { title, iconKey, iconColor } = resolveSidePanelRoutedPageInfo({
        path,
        hostableRouteMatch,
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
        pageTitle: pageTitle ?? title,
        pageIcon: getIcon(iconKey),
        pageIconColor: iconColor,
        pageId: pageComponentInstanceId,
        resetNavigationStack,
      });

      // The caller keys its own per-visit state off this, the way the morph
      // navigation stack does for a record.
      return pageComponentInstanceId;
    },
    [store, getIcon, navigateSidePanelMenu],
  );

  return { openRoutedPageInSidePanel };
};
