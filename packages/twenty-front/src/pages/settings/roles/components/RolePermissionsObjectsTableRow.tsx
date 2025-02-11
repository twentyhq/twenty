import { Table } from '@/ui/layout/table/components/Table';
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
  height: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(3)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1 0 0;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRow = styled(TableRow)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: 0px ${({ theme }) => theme.spacing(1)} 0px
    ${({ theme }) => theme.spacing(2)};
`;

type RolePermissionsObjectsTableRowProps = {
  permission: RolePermissionsObjectPermission;
};

export const RolePermissionsObjectsTableRow = ({
  permission,
}: RolePermissionsObjectsTableRowProps) => {
  return (
    <Table>
      <StyledTableRow key={permission.key}>
        <StyledPermissionCell>
          <StyledIconWrapper>
            <StyledIcon>{permission.icon}</StyledIcon>
          </StyledIconWrapper>
          <StyledLabel>{permission.label}</StyledLabel>
        </StyledPermissionCell>
        <TableCell>
          <Checkbox checked={permission.value} disabled />
        </TableCell>
      </StyledTableRow>
    </Table>
  );
};
