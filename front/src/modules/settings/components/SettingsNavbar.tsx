import { useMatch, useResolvedPath } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import { removeTokens } from '@/auth/services/AuthService';
import {
  IconColorSwatch,
  IconLogout,
  IconSettings,
  IconUser,
} from '@/ui/icons/index';
import NavBackButton from '@/ui/layout/navbar//NavBackButton';
import NavItem from '@/ui/layout/navbar/NavItem';
import NavItemsContainer from '@/ui/layout/navbar/NavItemsContainer';
import NavTitle from '@/ui/layout/navbar/NavTitle';

export function SettingsNavbar() {
  const theme = useTheme();
  return (
    <>
      <NavBackButton title="Settings" />
      <NavItemsContainer>
        <NavTitle label="User" />
        <NavItem
          label="Profile"
          to="/settings/profile"
          icon={<IconUser size={theme.iconSizeMedium} />}
          active={
            !!useMatch({
              path: useResolvedPath('/people').pathname,
              end: true,
            })
          }
        />
        <NavItem
          label="Experience"
          to="/settings/profile/experience"
          icon={<IconColorSwatch size={theme.iconSizeMedium} />}
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
          label="General"
          to="/settings/workspace"
          icon={<IconSettings size={theme.iconSizeMedium} />}
          soon={true}
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
          onClick={removeTokens}
          icon={<IconLogout size={theme.iconSizeMedium} />}
          danger={true}
        />
      </NavItemsContainer>
    </>
  );
}
