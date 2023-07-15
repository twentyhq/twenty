import { useLocation } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { SettingsNavbar } from '@/settings/components/SettingsNavbar';
import {
  IconBuildingSkyscraper,
  IconInbox,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from '@/ui/icons/index';
import { useIsSubNavbarDisplayed } from '@/ui/layout/hooks/useIsSubNavbarDisplayed';
import MainNavbar from '@/ui/layout/navbar/MainNavbar';

import NavItem from './modules/ui/layout/navbar/NavItem';
import NavTitle from './modules/ui/layout/navbar/NavTitle';

export function AppNavbar() {
  const theme = useTheme();
  const currentPath = useLocation().pathname;

  const isSubNavbarDisplayed = useIsSubNavbarDisplayed();

  return (
    <>
      {!isSubNavbarDisplayed ? (
        <MainNavbar>
          <>
            <NavItem
              label="Search"
              to="/search"
              icon={<IconSearch size={theme.icon.size.md} />}
              soon={true}
            />
            <NavItem
              label="Inbox"
              to="/inbox"
              icon={<IconInbox size={theme.icon.size.md} />}
              soon={true}
            />
            <NavItem
              label="Settings"
              to="/settings/profile"
              icon={<IconSettings size={theme.icon.size.md} />}
            />
            <NavTitle label="Workspace" />
            <NavItem
              label="People"
              to="/people"
              icon={<IconUser size={theme.icon.size.md} />}
              active={currentPath === '/people'}
            />
            <NavItem
              label="Companies"
              to="/companies"
              icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
              active={currentPath === '/companies'}
            />
            <NavItem
              label="Opportunities"
              to="/opportunities"
              icon={<IconTargetArrow size={theme.icon.size.md} />}
              active={currentPath === '/opportunities'}
            />
          </>
        </MainNavbar>
      ) : (
        <SettingsNavbar />
      )}
    </>
  );
}
