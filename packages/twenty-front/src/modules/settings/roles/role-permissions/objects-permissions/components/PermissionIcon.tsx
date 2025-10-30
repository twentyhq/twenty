import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

type PermissionIconProps = {
  permission: SettingsRoleObjectPermissionKey;
  state: 'granted' | 'revoked';
};

const StyledIconWrapper = styled.div<{ isRevoked?: boolean }>`
  align-items: center;
  background: ${({ theme, isRevoked }) =>
    isRevoked ? theme.color.orange3 : theme.color.blue3};
  border: 1px solid
    ${({ theme, isRevoked }) =>
      isRevoked ? theme.color.orange7 : theme.color.blue7};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledIcon = styled.div<{ isRevoked?: boolean }>`
  align-items: center;
  display: flex;
  color: ${({ theme, isRevoked }) =>
    isRevoked ? theme.color.orange : theme.color.blue};
  justify-content: center;
`;

export const PermissionIcon = ({ permission, state }: PermissionIconProps) => {
  const theme = useTheme();

  const { Icon, IconForbidden } =
    SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[permission];

  const isRevoked = state === 'revoked';

  return (
    <StyledIconWrapper isRevoked={isRevoked}>
      <StyledIcon isRevoked={isRevoked}>
        {isRevoked && <IconForbidden size={theme.icon.size.sm} />}
        {!isRevoked && <Icon size={theme.icon.size.sm} />}
      </StyledIcon>
    </StyledIconWrapper>
  );
};
