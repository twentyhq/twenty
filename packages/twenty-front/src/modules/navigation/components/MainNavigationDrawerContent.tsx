import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
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
  const isInboxEnabled = useIsInboxEnabled();

  const showAiChatContent =
    hasAiPermission &&
    activeNavigationDrawerMode === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;
  const showInboxContent =
    isInboxEnabled &&
    activeNavigationDrawerMode === NAVIGATION_DRAWER_TABS.INBOX;

  return (
    <NavigationDrawerScrollableContent>
      <NavigationDrawerTabbedContent
        showAiChatContent={showAiChatContent}
        shouldMountAiChatContent={hasAiPermission}
        showInboxContent={showInboxContent}
        shouldMountInboxContent={isInboxEnabled}
        navigationContent={<MainNavigationDrawerNavigationContent />}
      />
    </NavigationDrawerScrollableContent>
  );
};
