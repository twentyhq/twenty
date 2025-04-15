import { SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectPermissionIconConfig';
import { SettingsRolePermissionsObjectPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import pluralize from 'pluralize';
import { Checkbox, CheckboxAccent } from 'twenty-ui/input';

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledOverrideInfo = styled.span`
  background: ${({ theme }) => theme.adaptiveColors.orange1};
  border-radius: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.color.orange};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledCheckboxCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableRow = styled(TableRow)`
  align-items: center;
  display: flex;
`;

type SettingsRolePermissionsObjectsTableRowProps = {
  permission: SettingsRolePermissionsObjectPermission;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectsTableRow = ({
  permission,
  isEditable,
}: SettingsRolePermissionsObjectsTableRowProps) => {
  const theme = useTheme();

  const isOverriddenBy = permission.overriddenBy;
  const isOverridden = isOverriddenBy && isOverriddenBy > 0;
  const label = permission.label;
  const pluralizedObject = pluralize('object', isOverriddenBy);

  const { Icon } = SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[permission.key];

  return (
    <StyledTableRow>
      <StyledPermissionCell>
        <Icon size={theme.icon.size.sm} />
        <StyledLabel>{label}</StyledLabel>
        {isOverridden ? (
          <StyledOverrideInfo>
            {t`Overridden on ${isOverriddenBy} ${pluralizedObject}`}
          </StyledOverrideInfo>
        ) : null}
      </StyledPermissionCell>
      <StyledCheckboxCell>
        <Checkbox
          checked={permission.value ?? false}
          onChange={() => permission.setValue(!permission.value)}
          disabled={!isEditable}
          accent={isOverridden ? CheckboxAccent.Orange : CheckboxAccent.Blue}
        />
      </StyledCheckboxCell>
    </StyledTableRow>
  );
};
