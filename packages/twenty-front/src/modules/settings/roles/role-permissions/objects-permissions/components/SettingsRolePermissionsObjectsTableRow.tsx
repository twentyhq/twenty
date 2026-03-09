import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type SettingsRolePermissionsObjectPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { Checkbox, CheckboxAccent } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPermissionContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPermissionLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledOverrideInfo = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type SettingsRolePermissionsObjectsTableRowProps = {
  permission: SettingsRolePermissionsObjectPermission;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectsTableRow = ({
  permission,
  isEditable,
}: SettingsRolePermissionsObjectsTableRowProps) => {
  const revokedBy = permission.revokedBy;
  const grantedBy = permission.grantedBy;
  const isRevoked =
    revokedBy !== undefined && revokedBy !== null && revokedBy > 0;
  const label = permission.label;
  const isDisabled = !isEditable;

  const handleRowClick = () => {
    if (isDisabled) return;

    permission.setValue(!permission.value);
  };

  return (
    <TableRow
      onClick={handleRowClick}
      cursor={isDisabled ? 'default' : 'pointer'}
    >
      <TableCell gap={themeCssVariables.spacing[1]}>
        <StyledPermissionContent>
          <PermissionIcon
            permission={permission.key as SettingsRoleObjectPermissionKey}
            state={isRevoked ? 'revoked' : 'granted'}
          />
          <StyledPermissionLabel>{label}</StyledPermissionLabel>
        </StyledPermissionContent>
        <StyledOverrideInfo>
          {isRevoked && revokedBy > 0 ? (
            <>
              {' · '}
              {plural(revokedBy, {
                one: `Revoked for ${revokedBy} object`,
                other: `Revoked for ${revokedBy} objects`,
              })}
            </>
          ) : grantedBy && grantedBy > 0 ? (
            <>
              {' · '}
              {plural(grantedBy, {
                one: `Granted for ${grantedBy} object`,
                other: `Granted for ${grantedBy} objects`,
              })}
            </>
          ) : null}
        </StyledOverrideInfo>
      </TableCell>
      <TableCell
        align="right"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={permission.value ?? false}
          onChange={() => permission.setValue(!permission.value)}
          disabled={isDisabled}
          accent={isRevoked ? CheckboxAccent.Orange : CheckboxAccent.Blue}
        />
      </TableCell>
    </TableRow>
  );
};
