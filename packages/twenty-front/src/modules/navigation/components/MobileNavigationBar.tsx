import { useCreateNewAIChatThread } from '@/ai/hooks/useCreateNewAIChatThread';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { currentMobileNavigationDrawerState } from '@/navigation/states/currentMobileNavigationDrawerState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useNavigate } from 'react-router-dom';
import {
  type IconComponent,
  IconList,
  IconMessageCirclePlus,
  IconSearch,
} from 'twenty-ui/display';
import { NavigationBar } from 'twenty-ui/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type NavigationBarItemName = 'main' | 'search' | 'newAIChat';

export const MobileNavigationBar = () => {
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isCommandMenuOpened = useAtomStateValue(isCommandMenuOpenedState);
  const { closeCommandMenu } = useCommandMenu();
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();
  const isSettingsPage = useIsSettingsPage();
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const [currentMobileNavigationDrawer, setCurrentMobileNavigationDrawer] =
    useAtomState(currentMobileNavigationDrawerState);
  const { createChatThread } = useCreateNewAIChatThread();
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
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
    ...(isAiEnabled
      ? [
          {
            name: 'newAIChat' as const,
            Icon: IconMessageCirclePlus,
            onClick: () => {
              setIsNavigationDrawerExpanded(false);
              closeCommandMenu();
              createChatThread();
            },
          },
        ]
      : []),
  ];

  return <NavigationBar activeItemName={activeItemName} items={items} />;
};
