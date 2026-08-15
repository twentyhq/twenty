import { useLingui } from '@lingui/react/macro';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useHideMobileNavigationBarOnScrollDown } from '@/navigation/hooks/useHideMobileNavigationBarOnScrollDown';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { isMobileNavigationBarVisibleState } from '@/navigation/states/isMobileNavigationBarVisibleState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  type IconComponent,
  IconHome,
  IconMessageCirclePlus,
  IconSearch,
} from 'twenty-ui/icon';
import { NavigationBar } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type NavigationBarItemName = 'home' | 'search' | 'newAiChat';

type NavigationBarItemDefinition = {
  name: NavigationBarItemName;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
};

// The bar floats over the page, so the container has to let taps through to
// whatever is scrolling underneath it.
const StyledFloatingContainer = styled.div`
  bottom: 0;
  display: flex;
  left: 0;
  padding: ${themeCssVariables.spacing[3]};
  padding-bottom: calc(
    ${themeCssVariables.spacing[3]} + env(safe-area-inset-bottom, 0px)
  );
  pointer-events: none;
  position: absolute;
  right: 0;
  z-index: 1001;

  @media print {
    display: none;
  }
`;

export const MobileNavigationBar = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const isSettingsPage = useIsSettingsPage();
  const isSettingsDrawer = useIsSettingsDrawer();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isMobileNavigationBarVisible = useAtomStateValue(
    isMobileNavigationBarVisibleState,
  );

  useHideMobileNavigationBarOnScrollDown();

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

  const isHomePage = pathname === AppPath.Home;

  // The side panel is full screen on mobile, so the bar would be floating over
  // a view it does not navigate. It comes back when the panel closes.
  const isHidden = isSidePanelOpened || !isMobileNavigationBarVisible;

  const activeItemName: NavigationBarItemName | undefined = isHomePage
    ? 'home'
    : undefined;

  const items: NavigationBarItemDefinition[] = [
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
          if (firstObjectMetadataItem !== undefined) {
            setContextStoreCurrentObjectMetadataItemId(
              firstObjectMetadataItem.id,
            );
          }
        }

        openRecordsSearchPage();
      },
    },
  ];

  // Starting a chat is an action rather than a destination, so it sits apart
  // from the tabs. Without it there is nothing to balance the pill against, and
  // the bar falls back to a single centered group.
  const detachedItem: NavigationBarItemDefinition | undefined = hasAiPermission
    ? {
        name: 'newAiChat',
        label: t`New AI chat`,
        Icon: IconMessageCirclePlus,
        onClick: () => {
          closeSidePanelMenu();
          closeSettingsDrawer();
          switchToNewChat();
        },
      }
    : undefined;

  return (
    <StyledFloatingContainer>
      <NavigationBar
        activeItemName={activeItemName ?? ''}
        isHidden={isHidden}
        items={items}
        detachedItem={detachedItem}
      />
    </StyledFloatingContainer>
  );
};
