import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MainNavigationDrawerFixedItems } from '@/navigation/components/MainNavigationDrawerFixedItems';
import { MainNavigationDrawerScrollableItems } from '@/navigation/components/MainNavigationDrawerScrollableItems';
import { SupportDropdown } from '@/support/components/SupportDropdown';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';

export const MainNavigationDrawer = ({ className }: { className?: string }) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return (
    <NavigationDrawer
      className={className}
      title={currentWorkspace?.displayName ?? ''}
    >
      <MainNavigationDrawerFixedItems />
      <MainNavigationDrawerScrollableItems />
      <SupportDropdown />
    </NavigationDrawer>
  );
};
