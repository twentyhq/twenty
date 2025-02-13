import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Checkbox } from 'twenty-ui';

const StyledTableHeaderRow = styled(TableRow)`
  display: flex;
`;

const StyledNameHeader = styled(TableHeader)`
  flex: 1;
`;

const StyledActionsHeader = styled(TableHeader)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

const StyledTable = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type RolePermissionsObjectsTableHeaderProps = {
  className?: string;
  allPermissions: boolean;
};

export const RolePermissionsObjectsTableHeader = ({
  className,
  allPermissions,
}: RolePermissionsObjectsTableHeaderProps) => (
  <StyledTable className={className}>
    <StyledTableHeaderRow>
      <StyledNameHeader>{t`Name`}</StyledNameHeader>
      <StyledActionsHeader aria-label={t`Actions`}>
        <Checkbox checked={allPermissions} disabled />
      </StyledActionsHeader>
    </StyledTableHeaderRow>
  </StyledTable>
);
