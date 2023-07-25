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
} from '@/ui/icon/index';
import NavItem from '@/ui/navbar/components/NavItem';
import NavTitle from '@/ui/navbar/components/NavTitle';
import SubMenuNavbar from '@/ui/navbar/components/SubMenuNavbar';

export function SettingsNavbar() {
  const theme = useTheme();

  const { signOut } = useAuth();

  const handleLogout = useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <SubMenuNavbar backButtonTitle="Settings">
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
    </SubMenuNavbar>
  );
}
