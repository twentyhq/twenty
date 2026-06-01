import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { NavigationDrawerAiChatContent } from '@/ai/components/NavigationDrawerAiChatContent';
import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { MainNavigationDrawerTabsRow } from '@/navigation/components/MainNavigationDrawerTabsRow';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { REACT_APP_SHAHRYAR_MODE } from '~/config';

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const navigationDrawerActiveTab = useAtomStateValue(
    navigationDrawerActiveTabState,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const showAiChatContent =
    !REACT_APP_SHAHRYAR_MODE &&
    hasAiPermission &&
    navigationDrawerActiveTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;

  return (
    <NavigationDrawer
      className={className}
      title={
        REACT_APP_SHAHRYAR_MODE
          ? 'Shahryar OPS'
          : (currentWorkspace?.displayName ?? '')
      }
    >
      <NavigationDrawerFixedContent>
        {!REACT_APP_SHAHRYAR_MODE && <MainNavigationDrawerTabsRow />}
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        {showAiChatContent ? (
          <NavigationDrawerAiChatContent />
        ) : (
          <MainNavigationDrawerNavigationContent />
        )}
      </NavigationDrawerScrollableContent>
    </NavigationDrawer>
  );
};
