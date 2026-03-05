import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type PermissionIconProps = {
  permission: SettingsRoleObjectPermissionKey;
  state: 'granted' | 'revoked';
};

const StyledIconWrapper = styled.div<{ isRevoked?: boolean }>`
  align-items: center;
  background: ${({ isRevoked }) =>
    isRevoked
      ? themeCssVariables.color.orange3
      : themeCssVariables.color.blue3};
  border: 1px solid
    ${({ isRevoked }) =>
      isRevoked
        ? themeCssVariables.color.orange7
        : themeCssVariables.color.blue7};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  width: ${themeCssVariables.spacing[4]};
`;

const StyledIcon = styled.div<{ isRevoked?: boolean }>`
  align-items: center;
  display: flex;
  color: ${({ isRevoked }) =>
    isRevoked ? themeCssVariables.color.orange : themeCssVariables.color.blue};
  justify-content: center;
`;

export const PermissionIcon = ({ permission, state }: PermissionIconProps) => {
  const { Icon, IconForbidden } =
    SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[permission];

  const { theme } = useContext(ThemeContext);
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
