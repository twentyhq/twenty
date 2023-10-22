import { useCallback } from 'react';
import { useMatch, useNavigate, useResolvedPath } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { isDataModelSettingsEnabledState } from '@/client-config/states/isDataModelSettingsEnabled';
import { isDevelopersSettingsEnabledState } from '@/client-config/states/isDevelopersSettingsEnabled';
import { AppPath } from '@/types/AppPath';
import {
  IconColorSwatch,
  IconHierarchy2,
  IconLogout,
  IconRobot,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from '@/ui/display/icon/index';
import NavItem from '@/ui/navigation/navbar/components/NavItem';
import NavTitle from '@/ui/navigation/navbar/components/NavTitle';
import SubMenuNavbar from '@/ui/navigation/navbar/components/SubMenuNavbar';

export const SettingsNavbar = () => {
  const navigate = useNavigate();

  const { signOut } = useAuth();

  const handleLogout = useCallback(() => {
    signOut();
    navigate(AppPath.SignIn);
  }, [signOut, navigate]);

  const isDataModelSettingsEnabled = useRecoilValue(
    isDataModelSettingsEnabledState,
  );
  const isDevelopersSettingsEnabled = useRecoilValue(
    isDevelopersSettingsEnabledState,
  );

  const isDataModelSettingsActive = !!useMatch({
    path: useResolvedPath('/settings/objects').pathname,
    end: false,
  });
  const isDevelopersSettingsActive = !!useMatch({
    path: useResolvedPath('/settings/api').pathname,
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
        label="Experience"
        to="/settings/profile/experience"
        Icon={IconColorSwatch}
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
      {isDataModelSettingsEnabled && (
        <NavItem
          label="Data model"
          to="/settings/objects"
          Icon={IconHierarchy2}
          active={isDataModelSettingsActive}
        />
      )}
      {isDevelopersSettingsEnabled && (
        <NavItem
          label="Developers"
          to="/settings/apis"
          Icon={IconRobot}
          active={isDevelopersSettingsActive}
        />
      )}
      <NavTitle label="Other" />
      <NavItem label="Logout" onClick={handleLogout} Icon={IconLogout} />
    </SubMenuNavbar>
  );
};
