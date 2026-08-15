import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconHome,
  IconMessageCirclePlus,
  IconSearch,
} from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type MobileNavigationBarItemName = 'home' | 'search' | 'newAiChat';

type MobileNavigationBarItem = {
  name: MobileNavigationBarItemName;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
};

export const useMobileNavigationBarItems = (): {
  items: MobileNavigationBarItem[];
  activeItemName: MobileNavigationBarItemName | undefined;
} => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const isSettingsPage = useIsSettingsPage();
  const isSettingsDrawer = useIsSettingsDrawer();
  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );
  const setCurrentMobileNavigationDrawer = useSetAtomState(
    currentMobileNavigationDrawerState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );

  // Settings is the one drawer left on mobile, and it stays open across
  // navigation, so it would cover whatever the bottom bar goes to. Guarded so a
  // tap outside settings leaves the persisted expansion alone: it is shared with
  // the desktop drawer, which every tap would otherwise collapse.
  const closeSettingsDrawer = () => {
    if (!isSettingsDrawer) {
      return;
    }

    setCurrentMobileNavigationDrawer('main');
    setIsNavigationDrawerExpanded(false);
  };

  return {
    activeItemName: pathname === AppPath.Home ? 'home' : undefined,
    items: [
      {
        name: 'home',
        label: t`Home`,
        Icon: IconHome,
        onClick: () => {
          closeSidePanelMenu();
          closeSettingsDrawer();
          navigate(AppPath.Home);
        },
      },
      {
        name: 'search',
        label: t`Search`,
        Icon: IconSearch,
        onClick: () => {
          closeSidePanelMenu();
          closeSettingsDrawer();

          if (isSettingsPage) {
            const firstObjectMetadataItem =
              alphaSortedActiveNonSystemObjectMetadataItems[0];
            if (isDefined(firstObjectMetadataItem)) {
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
              label: t`New AI chat`,
              Icon: IconMessageCirclePlus,
              onClick: () => {
                closeSidePanelMenu();
                closeSettingsDrawer();
                switchToNewChat();
              },
            },
          ]
        : []),
    ],
  };
};
