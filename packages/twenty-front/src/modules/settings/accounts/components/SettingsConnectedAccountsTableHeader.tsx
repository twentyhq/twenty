import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';

const StyledTableHeader = styled(TableHeader)`
  padding-right: ${({ theme }) => theme.spacing(14)};
`;

export const SettingsConnectedAccountsTableHeader = () => {
  return (
    <Table>
      <TableRow gridAutoColumns="332px 1fr">
        <StyledTableHeader>
          <Trans>Account</Trans>
        </StyledTableHeader>
        <StyledTableHeader align="right">
          <Trans>Status</Trans>
        </StyledTableHeader>
      </TableRow>
    </Table>
  );
};
