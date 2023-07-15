import { useCallback } from 'react';
import { useMatch, useResolvedPath } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { useAuth } from '@/auth/hooks/useAuth';
import {
  IconColorSwatch,
  IconLogout,
  IconSettings,
  IconUser,
  IconUsers,
} from '@/ui/icons/index';
import NavItem from '@/ui/layout/navbar/NavItem';
import NavTitle from '@/ui/layout/navbar/NavTitle';
import SubNavbar from '@/ui/layout/navbar/sub-navbar/SubNavbar';

export function SettingsNavbar() {
  const theme = useTheme();

  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <SubNavbar backButtonTitle="Settings">
      <>
        <NavTitle label="User" />
        <NavItem
          label="Profile"
          to="/settings/profile"
          icon={<IconUser size={theme.icon.size.md} />}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/profile').pathname,
              end: true,
            })
          }
        />
        <NavItem
          label="Experience"
          to="/settings/profile/experience"
          icon={<IconColorSwatch size={theme.icon.size.md} />}
          soon={true}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/profile/experience').pathname,
              end: true,
            })
          }
        />
        <NavTitle label="Workspace" />
        <NavItem
          label="Members"
          to="/settings/workspace-members"
          icon={<IconUsers size={theme.icon.size.md} />}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/workspace-members').pathname,
              end: true,
            })
          }
        />
        <NavItem
          label="General"
          to="/settings/workspace"
          icon={<IconSettings size={theme.icon.size.md} />}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/workspace').pathname,
              end: true,
            })
          }
        />
        <NavTitle label="Other" />
        <NavItem
          label="Logout"
          onClick={handleLogout}
          icon={<IconLogout size={theme.icon.size.md} />}
          danger={true}
        />
      </>
    </SubNavbar>
  );
}
