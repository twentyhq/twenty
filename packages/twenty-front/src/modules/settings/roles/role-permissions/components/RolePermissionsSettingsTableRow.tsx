import { RolePermissionsSettingPermission } from '@/settings/roles/types/RolePermissionsSettingPermission';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { Checkbox } from 'twenty-ui';

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledType = styled(StyledLabel)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
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

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

type RolePermissionsSettingsTableRowProps = {
  permission: RolePermissionsSettingPermission;
};

export const RolePermissionsSettingsTableRow = ({
  permission,
}: RolePermissionsSettingsTableRowProps) => {
  return (
    <StyledTableRow key={permission.key}>
      <StyledPermissionCell>
        <StyledLabel>{permission.label}</StyledLabel>
      </StyledPermissionCell>
      <StyledPermissionCell>
        <StyledIconContainer>
          <permission.Icon size={14} />
        </StyledIconContainer>
        <StyledType>{permission.type}</StyledType>
      </StyledPermissionCell>
      <StyledCheckboxCell>
        <Checkbox checked={permission.value} disabled />
      </StyledCheckboxCell>
    </StyledTableRow>
  );
};
