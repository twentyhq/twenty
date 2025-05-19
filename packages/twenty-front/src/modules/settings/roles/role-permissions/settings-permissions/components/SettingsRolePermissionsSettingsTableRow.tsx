import { SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/settings-permissions/types/SettingsRolePermissionsSettingPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { Checkbox } from 'twenty-ui/input';
import { v4 } from 'uuid';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
  padding-right: ${({ theme }) => theme.spacing(4)};
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
  const isPermissionsV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsV2Enabled,
  );
  const canUpdateAllSettings = settingsDraftRole.canUpdateAllSettings;

  const isSettingPermissionEnabled =
    settingsDraftRole.settingPermissions?.some(
      (settingPermission) => settingPermission.setting === permission.key,
    ) ?? false;

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

  return (
    <TableRow key={permission.key} gridAutoColumns="3fr 4fr 24px">
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
      <StyledCheckboxCell>
        <Checkbox
          checked={isSettingPermissionEnabled || canUpdateAllSettings}
          disabled={
            !isEditable || canUpdateAllSettings || !isPermissionsV2Enabled
          }
          onChange={(event) => handleChange(event.target.checked)}
        />
      </StyledCheckboxCell>
    </TableRow>
  );
};
