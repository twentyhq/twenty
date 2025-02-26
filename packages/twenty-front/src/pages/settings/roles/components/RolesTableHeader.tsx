import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';

const StyledTableHeaderRow = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const RolesTableHeader = () => {
  return (
    <StyledTableHeaderRow>
      <TableRow>
        <TableHeader>
          <Trans>Name</Trans>
        </TableHeader>
        <TableHeader align={'right'}>
          <Trans>Assigned to</Trans>
        </TableHeader>
        <TableHeader align={'right'}></TableHeader>
      </TableRow>
    </StyledTableHeaderRow>
  );
};
