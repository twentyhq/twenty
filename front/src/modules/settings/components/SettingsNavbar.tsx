import { useCallback } from 'react';
import { useMatch, useNavigate, useResolvedPath } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import {
  IconColorSwatch,
  IconLogout,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from '@/ui/icon/index';
import NavItem from '@/ui/navbar/components/NavItem';
import NavTitle from '@/ui/navbar/components/NavTitle';
import SubMenuNavbar from '@/ui/navbar/components/SubMenuNavbar';

import packageJson from '../../../../package.json';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2.5)};
`;

const StyledVersion = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: center;
  span {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

export function SettingsNavbar() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { signOut } = useAuth();

  const handleLogout = useCallback(() => {
    signOut();
    navigate(AppPath.SignIn);
  }, [signOut, navigate]);

  const version = packageJson.version;

  return (
    <StyledContainer>
      <SubMenuNavbar backButtonTitle="Settings">
        <NavTitle label="User" />
        <NavItem
          label="Profile"
          to="/settings/profile"
          icon={<IconUserCircle size={theme.icon.size.md} />}
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
        <NavTitle label="Other" />
        <NavItem
          label="Logout"
          onClick={handleLogout}
          icon={<IconLogout size={theme.icon.size.md} />}
        />
      </SubMenuNavbar>
      <StyledVersion>
        <span>Version {version}</span>
      </StyledVersion>
    </StyledContainer>
  );
}
