import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useNavigate } from 'react-router-dom';
import {
  type IconComponent,
  IconList,
  IconSearch,
  IconSettings,
} from 'twenty-ui/display';
import { NavigationBar } from 'twenty-ui/navigation';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';

type NavigationBarItemName = 'main' | 'search' | 'tasks' | 'settings';

export const MobileNavigationBar = () => {
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isCommandMenuOpened = useAtomStateValue(isCommandMenuOpenedStateV2);
  const { closeCommandMenu } = useCommandMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();
  const isSettingsPage = useIsSettingsPage();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const [currentMobileNavigationDrawer, setCurrentMobileNavigationDrawer] =
    useAtomState(currentMobileNavigationDrawerState);
  const { openSettingsMenu } = useOpenSettingsMenu();
  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const [, setContextStoreCurrentObjectMetadataItemId] = useAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const activeItemName = isNavigationDrawerExpanded
    ? currentMobileNavigationDrawer
    : isCommandMenuOpened
      ? 'search'
      : isSettingsPage
        ? 'settings'
        : 'main';

  const items: {
    name: NavigationBarItemName;
    Icon: IconComponent;
    onClick: () => void;
  }[] = [
    {
      name: 'main',
      Icon: IconList,
      onClick: () => {
        closeCommandMenu();
        setIsNavigationDrawerExpanded(
          (previousIsOpen) => activeItemName !== 'main' || !previousIsOpen,
        );
        setCurrentMobileNavigationDrawer('main');

        if (isSettingsPage) {
          navigate(defaultHomePagePath);
        }
      },
    },
    {
      name: 'search',
      Icon: IconSearch,
      onClick: () => {
        setIsNavigationDrawerExpanded(false);
        closeCommandMenu();

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
    {
      name: 'settings',
      Icon: IconSettings,
      onClick: () => {
        closeCommandMenu();
        openSettingsMenu();
      },
    },
  ];

  return <NavigationBar activeItemName={activeItemName} items={items} />;
};
