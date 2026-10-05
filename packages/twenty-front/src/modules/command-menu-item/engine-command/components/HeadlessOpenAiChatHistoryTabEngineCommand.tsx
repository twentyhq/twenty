import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
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

  const onExecute = () => {
    setIsNavigationDrawerExpanded(true);
    setNavigationDrawerActiveTab(NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY);
  };

  return <HeadlessEngineCommandWrapperEffect execute={onExecute} />;
};
