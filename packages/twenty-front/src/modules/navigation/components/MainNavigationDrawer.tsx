import { MainNavigationDrawerModeSwitcher } from '@/navigation/components/MainNavigationDrawerModeSwitcher';
import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { NavigationDrawerTabbedContent } from '@/navigation/components/NavigationDrawerTabbedContent';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const showAiChatContent =
    hasAiPermission &&
    activeNavigationDrawerMode === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;

  return (
    <NavigationDrawer className={className}>
      <NavigationDrawerFixedContent>
        <MainNavigationDrawerModeSwitcher />
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        <NavigationDrawerTabbedContent
          showAiChatContent={showAiChatContent}
          shouldMountAiChatContent={hasAiPermission}
          navigationContent={<MainNavigationDrawerNavigationContent />}
        />
      </NavigationDrawerScrollableContent>
    </NavigationDrawer>
  );
};
