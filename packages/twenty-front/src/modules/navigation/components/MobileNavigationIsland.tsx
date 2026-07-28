import { useLingui } from '@lingui/react/macro';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useNavigate } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { IconList, IconMessageCirclePlus, IconSearch } from 'twenty-ui/icon';
import {
  NavigationIsland,
  type NavigationIslandItem,
} from 'twenty-ui/navigation';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type NavigationIslandItemName = 'main' | 'search' | 'newAiChat';

export const MobileNavigationIsland = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const navigationMemorizedUrl = useAtomStateValue(navigationMemorizedUrlState);
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const isSettingsPage = useIsSettingsPage();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const [currentMobileNavigationDrawer, setCurrentMobileNavigationDrawer] =
    useAtomState(currentMobileNavigationDrawerState);
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const isAiChatOpenedInSidePanel =
    isSidePanelOpened &&
    (sidePanelPage === SidePanelPages.AskAI ||
      sidePanelPage === SidePanelPages.ViewPreviousAiChats);

  const activeItemName = isNavigationDrawerExpanded
    ? currentMobileNavigationDrawer
    : isAiChatOpenedInSidePanel
      ? 'newAiChat'
      : isSidePanelOpened
        ? 'search'
        : 'main';

  const items: (NavigationIslandItem & { name: NavigationIslandItemName })[] = [
    {
      name: 'main',
      label: t`Menu`,
      Icon: IconList,
      onClick: () => {
        closeSidePanelMenu();
        setIsNavigationDrawerExpanded(
          (previousIsOpen) => activeItemName !== 'main' || !previousIsOpen,
        );
        setCurrentMobileNavigationDrawer('main');

        if (isSettingsPage) {
          navigate(
            navigationMemorizedUrl !== '/'
              ? navigationMemorizedUrl
              : defaultHomePagePath,
          );
        }
      },
    },
    {
      name: 'search',
      label: t`Search`,
      Icon: IconSearch,
      onClick: () => {
        setIsNavigationDrawerExpanded(false);
        closeSidePanelMenu();

        if (isSettingsPage) {
          const firstObjectMetadataItem =
            alphaSortedActiveNonSystemObjectMetadataItems[0];
          if (firstObjectMetadataItem !== undefined) {
            setContextStoreCurrentObjectMetadataItemId(
              firstObjectMetadataItem.id,
            );
          }
        }

        openRecordsSearchPage();
      },
    },
    ...(hasAiPermission
      ? [
          {
            name: 'newAiChat' as const,
            label: t`AI chat`,
            Icon: IconMessageCirclePlus,
            onClick: () => {
              setIsNavigationDrawerExpanded(false);
              closeSidePanelMenu();
              switchToNewChat();
            },
          },
        ]
      : []),
  ];

  return <NavigationIsland activeItemName={activeItemName} items={items} />;
};
