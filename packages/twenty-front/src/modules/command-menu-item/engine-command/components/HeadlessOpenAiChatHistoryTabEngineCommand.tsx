import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { useNavigationMenuAiChatSections } from '@/navigation-menu-item/display/hooks/useNavigationMenuAiChatSections';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const HeadlessOpenAiChatHistoryTabEngineCommand = () => {
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );
  const setNavigationDrawerActiveTab = useSetAtomState(
    navigationDrawerActiveTabState,
  );
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const aiChatSections = useNavigationMenuAiChatSections();
  const chatHistorySection =
    aiChatSections.find(
      (section) => section.type === NavigationMenuItemType.AI_CHAT_RECENTS,
    ) ?? aiChatSections[0];

  const onExecute = () => {
    setIsNavigationDrawerExpanded(true);

    if (isDefined(chatHistorySection)) {
      setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.NAVIGATION_MENU);
      setCurrentNavigationMenuTabId(chatHistorySection.folderId ?? null);
      return;
    }

    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
  };

  return <HeadlessEngineCommandWrapperEffect execute={onExecute} />;
};
