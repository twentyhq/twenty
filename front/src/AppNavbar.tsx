import { useLocation } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { SettingsNavbar } from '@/settings/components/SettingsNavbar';
import {
  IconBuildingSkyscraper,
  IconInbox,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from '@/ui/icon/index';
import { useIsSubNavbarDisplayed } from '@/ui/layout/hooks/useIsSubNavbarDisplayed';
import MainNavbar from '@/ui/navbar/components/MainNavbar';
import NavItem from '@/ui/navbar/components/NavItem';
import NavTitle from '@/ui/navbar/components/NavTitle';

export function AppNavbar() {
  const theme = useTheme();
  const currentPath = useLocation().pathname;
  const { openCommandMenu } = useCommandMenu();

  const isSubNavbarDisplayed = useIsSubNavbarDisplayed();

  return (
    <>
      {!isSubNavbarDisplayed ? (
        <MainNavbar>
          <>
            <NavItem
              label="Search"
              icon={<IconSearch size={theme.icon.size.md} />}
              onClick={() => {
                openCommandMenu();
              }}
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
              label="Companies"
              to="/companies"
              icon={<IconBuildingSkyscraper size={theme.icon.size.md} />}
              active={currentPath === '/companies'}
            />
            <NavItem
              label="People"
              to="/people"
              icon={<IconUser size={theme.icon.size.md} />}
              active={currentPath === '/people'}
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
