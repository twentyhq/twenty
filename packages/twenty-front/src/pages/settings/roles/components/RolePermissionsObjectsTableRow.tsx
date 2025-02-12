import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { Checkbox } from 'twenty-ui';
import { RolePermissionsObjectPermission } from '~/pages/settings/roles/types/RolePermissionsObjectPermission';

const StyledIconWrapper = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.color.blue10};
  border: 1px solid ${({ theme }) => theme.color.blue30};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledIcon = styled.div`
  align-items: center;
  display: flex;
  color: ${({ theme }) => theme.color.blue};
  justify-content: center;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
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

type RolePermissionsObjectsTableRowProps = {
  permission: RolePermissionsObjectPermission;
};

export const RolePermissionsObjectsTableRow = ({
  permission,
}: RolePermissionsObjectsTableRowProps) => {
  return (
    <StyledTableRow key={permission.key}>
      <StyledPermissionCell>
        <StyledIconWrapper>
          <StyledIcon>{permission.icon}</StyledIcon>
        </StyledIconWrapper>
        <StyledLabel>{permission.label}</StyledLabel>
      </StyledPermissionCell>
      <StyledCheckboxCell>
        <Checkbox checked={permission.value} disabled />
      </StyledCheckboxCell>
    </StyledTableRow>
  );
};
