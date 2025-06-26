import { SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/settings-permissions/types/SettingsRolePermissionsSettingPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { Checkbox } from 'twenty-ui/input';
import { v4 } from 'uuid';

const StyledTableRow = styled(TableRow)<{ isDisabled: boolean }>`
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};
`;

const StyledName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDescription = styled(StyledName)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCheckboxCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(1)};
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
};

export const SettingsRolePermissionsSettingsTableRow = ({
  roleId,
  permission,
  isEditable,
}: SettingsRolePermissionsSettingsTableRowProps) => {
  const theme = useTheme();
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );
  const canUpdateAllSettings = settingsDraftRole.canUpdateAllSettings;

  const isSettingPermissionEnabled =
    settingsDraftRole.settingPermissions?.some(
      (settingPermission) => settingPermission.setting === permission.key,
    ) ?? false;

  const isChecked = isSettingPermissionEnabled || canUpdateAllSettings;
  const isDisabled = !isEditable || canUpdateAllSettings;

  const handleChange = (value: boolean) => {
    const currentPermissions = settingsDraftRole.settingPermissions ?? [];

    if (value === true) {
      setSettingsDraftRole({
        ...settingsDraftRole,
        settingPermissions: [
          ...currentPermissions,
          {
            id: v4(),
            setting: permission.key,
            roleId,
          },
        ],
      });
    } else {
      setSettingsDraftRole({
        ...settingsDraftRole,
        settingPermissions: currentPermissions.filter(
          (p) => p.setting !== permission.key,
        ),
      });
    }
  };

  const handleRowClick = () => {
    if (isDisabled) return;
    handleChange(!isChecked);
  };

  return (
    <StyledTableRow
      key={permission.key}
      gridAutoColumns="3fr 4fr 24px"
      onClick={handleRowClick}
      isDisabled={isDisabled}
    >
      <StyledPermissionCell>
        <StyledIconContainer>
          <permission.Icon
            size={theme.icon.size.md}
            color={theme.font.color.primary}
            stroke={theme.icon.stroke.sm}
          />
        </StyledIconContainer>
        <StyledName>{permission.name}</StyledName>
      </StyledPermissionCell>
      <StyledPermissionCell>
        <StyledDescription>{permission.description}</StyledDescription>
      </StyledPermissionCell>
      <StyledCheckboxCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isChecked}
          disabled={isDisabled}
          onChange={(event) => handleChange(event.target.checked)}
        />
      </StyledCheckboxCell>
    </StyledTableRow>
  );
};
