import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { NavigationDrawerTabbedContent } from '@/navigation/components/NavigationDrawerTabbedContent';
import { useActiveNavigationDrawerMode } from '@/navigation/hooks/useActiveNavigationDrawerMode';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const MainNavigationDrawerContent = () => {
  const activeNavigationDrawerMode = useActiveNavigationDrawerMode();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const showInboxContent =
    hasAiPermission &&
    activeNavigationDrawerMode === NAVIGATION_DRAWER_TABS.INBOX_HISTORY;

  return (
    <NavigationDrawerScrollableContent>
      <NavigationDrawerTabbedContent
        showInboxContent={showInboxContent}
        shouldMountInboxContent={hasAiPermission}
        navigationContent={<MainNavigationDrawerNavigationContent />}
      />
    </NavigationDrawerScrollableContent>
  );
};
