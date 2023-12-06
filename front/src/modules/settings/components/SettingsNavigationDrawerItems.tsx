import { useCallback } from 'react';
import { useMatch, useNavigate, useResolvedPath } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import {
  IconAt,
  IconColorSwatch,
  IconHierarchy2,
  IconLogout,
  IconRobot,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from '@/ui/display/icon';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const SettingsNavigationDrawerItems = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = useCallback(() => {
    signOut();
    navigate(AppPath.SignIn);
  }, [signOut, navigate]);

  const isMessagingEnabled = useIsFeatureEnabled('IS_MESSAGING_ENABLED');
  const isMessagingActive = !!useMatch({
    path: useResolvedPath('/settings/accounts').pathname,
    end: true,
  });

  return (
    <>
      <NavigationDrawerSectionTitle label="User" />
      <NavigationDrawerItem
        label="Profile"
        to="/settings/profile"
        Icon={IconUserCircle}
        active={
          !!useMatch({
            path: useResolvedPath('/settings/profile').pathname,
            end: true,
          })
        }
      />
      <NavigationDrawerItem
        label="Appearance"
        to="/settings/profile/appearance"
        Icon={IconColorSwatch}
        active={
          !!useMatch({
            path: useResolvedPath('/settings/profile/appearance').pathname,
            end: true,
          })
        }
      />
      {isMessagingEnabled && (
        <NavigationDrawerItem
          label="Accounts"
          to="/settings/accounts"
          Icon={IconAt}
          active={isMessagingActive}
        />
      )}

      <NavigationDrawerSectionTitle label="Workspace" />
      <NavigationDrawerItem
        label="General"
        to="/settings/workspace"
        Icon={IconSettings}
        active={
          !!useMatch({
            path: useResolvedPath('/settings/workspace').pathname,
            end: true,
          })
        }
      />
      <NavigationDrawerItem
        label="Members"
        to="/settings/workspace-members"
        Icon={IconUsers}
        active={
          !!useMatch({
            path: useResolvedPath('/settings/workspace-members').pathname,
            end: true,
          })
        }
      />
      <NavigationDrawerItem
        label="Data model"
        to="/settings/objects"
        Icon={IconHierarchy2}
        active={
          !!useMatch({
            path: useResolvedPath('/settings/objects').pathname,
            end: false,
          })
        }
      />
      <NavigationDrawerItem
        label="Developers"
        to="/settings/developers/api-keys"
        Icon={IconRobot}
        active={
          !!useMatch({
            path: useResolvedPath('/settings/developers/api-keys').pathname,
            end: true,
          })
        }
      />

      <NavigationDrawerSectionTitle label="Other" />
      <NavigationDrawerItem
        label="Logout"
        onClick={handleLogout}
        Icon={IconLogout}
      />
    </>
  );
};
