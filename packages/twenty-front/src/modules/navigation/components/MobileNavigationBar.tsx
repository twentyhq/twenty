import { useLingui } from '@lingui/react/macro';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import {
  type IconComponent,
  IconHome,
  IconMessageCirclePlus,
  IconSearch,
} from 'twenty-ui/icon';
import { NavigationBar } from 'twenty-ui/navigation';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type NavigationBarItemName = 'home' | 'search' | 'newAiChat';

export const MobileNavigationBar = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();
  const isSettingsPage = useIsSettingsPage();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { alphaSortedActiveNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const setContextStoreCurrentObjectMetadataItemId = useSetAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const isHomePage = pathname === AppPath.Home;

  const activeItemName: NavigationBarItemName | undefined = isSidePanelOpened
    ? 'search'
    : isHomePage
      ? 'home'
      : undefined;

  const items: {
    name: NavigationBarItemName;
    label: string;
    Icon: IconComponent;
    onClick: () => void;
  }[] = [
    {
      name: 'home',
      label: t`Home`,
      Icon: IconHome,
      onClick: () => {
        closeSidePanelMenu();
        navigate(AppPath.Home);
      },
    },
    {
      name: 'search',
      label: t`Search`,
      Icon: IconSearch,
      onClick: () => {
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
            label: t`New AI chat`,
            Icon: IconMessageCirclePlus,
            onClick: () => {
              closeSidePanelMenu();
              switchToNewChat();
            },
          },
        ]
      : []),
  ];

  return <NavigationBar activeItemName={activeItemName ?? ''} items={items} />;
};
