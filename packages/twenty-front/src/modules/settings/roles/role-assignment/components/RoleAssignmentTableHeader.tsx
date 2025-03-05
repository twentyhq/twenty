import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

const StyledTableHeaderRow = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const RoleAssignmentTableHeader = () => (
  <StyledTableHeaderRow>
    <TableRow gridAutoColumns="2fr 4fr">
      <TableHeader>{t`Name`}</TableHeader>
      <TableHeader>{t`Email`}</TableHeader>
    </TableRow>
  </StyledTableHeaderRow>
);
