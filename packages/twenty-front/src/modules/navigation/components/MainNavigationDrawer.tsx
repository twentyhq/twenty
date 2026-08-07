import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { AskAiNavigationDrawerItem } from '@/navigation/components/AskAiNavigationDrawerItem';
import { MainNavigationDrawerNavigationContent } from '@/navigation/components/MainNavigationDrawerNavigationContent';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <NavigationDrawerFixedContent>
        <AskAiNavigationDrawerItem />
      </NavigationDrawerFixedContent>

      <NavigationDrawerScrollableContent>
        <MainNavigationDrawerNavigationContent />
      </NavigationDrawerScrollableContent>
    </NavigationDrawer>
  );
};
