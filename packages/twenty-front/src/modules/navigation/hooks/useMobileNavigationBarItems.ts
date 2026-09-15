import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { getInboxSectionPath } from '@/inbox/utils/getInboxSectionPath';
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
  IconInbox,
  IconMessageCirclePlus,
  IconSearch,
} from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { isInboxPath } from '~/utils/isInboxPath';

type MobileNavigationBarItemName = 'home' | 'inbox' | 'search' | 'newAiChat';

type MobileNavigationBarItem = {
  name: MobileNavigationBarItemName;
  label: string;
  Icon: IconComponent;
  onClick: () => void;
};

export const useMobileNavigationBarItems = (): {
  items: MobileNavigationBarItem[];
  activeItemName: MobileNavigationBarItemName | '';
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
  const isInboxEnabled = useIsInboxEnabled();

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

  // The expansion state is shared with the desktop drawer, so the guard keeps a
  // tap outside settings from collapsing it there.
  const closeSettingsDrawer = () => {
    if (!isSettingsDrawer) {
      return;
    }

    setCurrentMobileNavigationDrawer('main');
    setIsNavigationDrawerExpanded(false);
  };

  const activeItemName: MobileNavigationBarItemName | '' =
    pathname === AppPath.Home
      ? 'home'
      : isInboxEnabled && isInboxPath(pathname)
        ? 'inbox'
        : '';

  return {
    activeItemName,
    items: [
      {
        name: 'home',
        label: t`Home`,
        Icon: IconHome,
        onClick: () => {
          closeSidePanelMenu();
          closeSettingsDrawer();
          // Leaving settings replaces its entry the way desktop does, so that
          // going back does not drop the user straight into the settings they
          // just left.
          navigate(AppPath.Home, { replace: isSettingsDrawer });
        },
      },
      ...(isInboxEnabled
        ? [
            {
              name: 'inbox' as const,
              label: t`Inbox`,
              Icon: IconInbox,
              onClick: () => {
                closeSidePanelMenu();
                closeSettingsDrawer();
                navigate(getInboxSectionPath(DEFAULT_INBOX_SECTION));
              },
            },
          ]
        : []),
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
