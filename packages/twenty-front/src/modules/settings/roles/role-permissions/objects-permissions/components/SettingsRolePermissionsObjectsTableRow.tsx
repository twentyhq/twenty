import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectPermissionIconConfig';
import { SettingsRolePermissionsObjectPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import pluralize from 'pluralize';
import { Checkbox, CheckboxAccent } from 'twenty-ui/input';

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledPermissionContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPermissionLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledOverrideInfo = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;
const StyledCheckboxCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledTableRow = styled(TableRow)<{ isDisabled: boolean }>`
  align-items: center;
  display: flex;
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};
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
  const pluralizedRevokedObject = pluralize('object', revokedBy);
  const pluralizedGrantedObject = pluralize('object', grantedBy);
  const isDisabled = !isEditable;

  const handleRowClick = () => {
    if (isDisabled) return;

    permission.setValue(!permission.value);
  };

  return (
    <StyledTableRow onClick={handleRowClick} isDisabled={isDisabled}>
      <StyledPermissionCell>
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
              {t`Revoked for ${revokedBy} ${pluralizedRevokedObject}`}
            </>
          ) : grantedBy && grantedBy > 0 ? (
            <>
              {' · '}
              {t`Granted for ${grantedBy} ${pluralizedGrantedObject}`}
            </>
          ) : null}
        </StyledOverrideInfo>
      </StyledPermissionCell>
      <StyledCheckboxCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={permission.value ?? false}
          onChange={() => permission.setValue(!permission.value)}
          disabled={isDisabled}
          accent={isRevoked ? CheckboxAccent.Orange : CheckboxAccent.Blue}
        />
      </StyledCheckboxCell>
    </StyledTableRow>
  );
};
