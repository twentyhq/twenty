import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MainNavigationDrawerAIChatContent } from '@/navigation/components/MainNavigationDrawerAIChatContent';
import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { MainNavigationDrawerTabsRow } from '@/navigation/components/MainNavigationDrawerTabsRow';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const activeTab = useRecoilValueV2(navigationDrawerActiveTabState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <NavigationDrawerFixedContent>
        <MainNavigationDrawerTabsRow />
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        {activeTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY ? (
          <MainNavigationDrawerAIChatContent />
        ) : (
          <MainNavigationDrawerNavigationContent />
        )}
      </NavigationDrawerScrollableContent>
    </NavigationDrawer>
  );
};
