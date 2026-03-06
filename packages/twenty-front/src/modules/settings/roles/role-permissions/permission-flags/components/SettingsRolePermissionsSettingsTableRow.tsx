import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { Checkbox } from 'twenty-ui/input';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { v4 } from 'uuid';

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

type SettingsRolePermissionsSettingsTableRowProps = {
  roleId: string;
  permission: SettingsRolePermissionsSettingPermission;
  isEditable: boolean;
  isToolPermission?: boolean;
};

export const SettingsRolePermissionsSettingsTableRow = ({
  roleId,
  permission,
  isEditable,
}: SettingsRolePermissionsSettingsTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const isPermissionEnabled =
    settingsDraftRole.permissionFlags?.some(
      (permissionFlag) => permissionFlag.flag === permission.key,
    ) ?? false;

  const isAllSettingsOverride =
    !permission.isToolPermission &&
    settingsDraftRole.canUpdateAllSettings === true;
  const isAllToolsOverride =
    permission.isToolPermission && settingsDraftRole.canAccessAllTools === true;
  const isChecked = Boolean(
    isPermissionEnabled || isAllSettingsOverride || isAllToolsOverride,
  );
  const isDisabled = Boolean(
    !isEditable || isAllSettingsOverride || isAllToolsOverride,
  );

  const handleChange = (value: boolean) => {
    const currentPermissions = settingsDraftRole.permissionFlags ?? [];

    if (value === true) {
      setSettingsDraftRole({
        ...settingsDraftRole,
        permissionFlags: [
          ...currentPermissions,
          {
            id: v4(),
            flag: permission.key,
            roleId,
          },
        ],
      });
    } else {
      setSettingsDraftRole({
        ...settingsDraftRole,
        permissionFlags: currentPermissions.filter(
          (p) => p.flag !== permission.key,
        ),
      });
    }
  };

  const handleRowClick = () => {
    if (isDisabled) return;
    handleChange(!isChecked);
  };

  return (
    <TableRow
      key={permission.key}
      gridAutoColumns="3fr 4fr 24px"
      onClick={handleRowClick}
      cursor={isDisabled ? 'default' : 'pointer'}
    >
      <TableCell gap={themeCssVariables.spacing[2]}>
        <StyledIconContainer>
          <permission.Icon
            size={theme.icon.size.md}
            color={theme.font.color.primary}
            stroke={theme.icon.stroke.sm}
          />
        </StyledIconContainer>
        <StyledName>{permission.name}</StyledName>
      </TableCell>
      <TableCell gap={themeCssVariables.spacing[2]}>
        <StyledDescription>{permission.description}</StyledDescription>
      </TableCell>
      <TableCell
        align="right"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isChecked}
          disabled={isDisabled}
          onChange={(event) => handleChange(event.target.checked)}
        />
      </TableCell>
    </TableRow>
  );
};
