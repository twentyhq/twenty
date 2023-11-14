import { useLocation } from 'react-router-dom';

import { Favorites } from '@/favorites/components/Favorites';
import { SettingsNavbar } from '@/settings/components/SettingsNavbar';
import { useIsSubMenuNavbarDisplayed } from '@/ui/layout/hooks/useIsSubMenuNavbarDisplayed';
import WorkspaceItems from '@/ui/navigation/navbar/components/WorkspaceItems';
import MainNavbar from '@/ui/navigation/navbar/desktop-navbar/components/MainNavbar';

export const MobileNavBar = () => {
  const isInSubMenu = useIsSubMenuNavbarDisplayed();
  const currentPath = useLocation().pathname;

  return (
    <>
      {!isInSubMenu ? (
        <MainNavbar>
          <Favorites />
          <WorkspaceItems currentPath={currentPath} />
        </MainNavbar>
      ) : (
        <SettingsNavbar />
      )}
    </>
  );
};
