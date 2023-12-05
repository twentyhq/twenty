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
import NavItem from '@/ui/navigation/navigation-drawer/components/NavItem';
import NavTitle from '@/ui/navigation/navigation-drawer/components/NavTitle';
import SubMenuNavbar from '@/ui/navigation/navigation-drawer/components/SubMenuNavbar';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const SettingsNavbar = () => {
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
    <SubMenuNavbar backButtonTitle="Settings" displayVersion={true}>
      <NavTitle label="User" />
      <NavItem
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
      <NavItem
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
        <NavItem
          label="Accounts"
          to="/settings/accounts"
          Icon={IconAt}
          active={isMessagingActive}
        />
      )}

      <NavTitle label="Workspace" />
      <NavItem
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
      <NavItem
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
      <NavItem
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
      <NavItem
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

      <NavTitle label="Other" />
      <NavItem label="Logout" onClick={handleLogout} Icon={IconLogout} />
    </SubMenuNavbar>
  );
};
