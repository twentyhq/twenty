import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Trans } from '@lingui/react/macro';

export const SettingsRolesTableHeader = () => {
  return (
    <Table>
      <TableRow gridAutoColumns="332px 3fr 2fr 1fr">
        <TableHeader>
          <Trans>Name</Trans>
        </TableHeader>
        <TableHeader align="right">
          <Trans>Assigned to</Trans>
        </TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
    </Table>
  );
};
