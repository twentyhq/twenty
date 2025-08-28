import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Trans } from '@lingui/react/macro';

export const SettingsMessageFoldersTableHeader = () => {
  return (
    <Table>
      <TableRow gridAutoColumns="1fr 120px">
        <TableHeader>
          <Trans>Folder</Trans>
        </TableHeader>
        <TableHeader align="center">
          <Trans>Sync</Trans>
        </TableHeader>
      </TableRow>
    </Table>
  );
};
