import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Trans } from '@lingui/react/macro';

export const SettingsConnectedAccountsTableHeader = () => {
  return (
    <Table>
      <TableRow gridAutoColumns="332px 1fr 1fr">
        <TableHeader>
          <Trans>Account</Trans>
        </TableHeader>
        <TableHeader align={'right'}>
          <Trans>Status</Trans>
        </TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
    </Table>
  );
};
