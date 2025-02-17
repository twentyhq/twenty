import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { MessageChannelSyncJobByStatusCounter } from '~/generated/graphql';

export const SettingsAdminHealthMessageSyncCountersTable = ({
  messageSync,
}: {
  messageSync: MessageChannelSyncJobByStatusCounter;
}) => (
  <Table>
    <TableRow>
      <TableHeader>Status</TableHeader>
      <TableHeader align="right">Count</TableHeader>
    </TableRow>
    <TableRow>
      <TableCell>Message Not Synced</TableCell>
      <TableCell align="right">{messageSync.NOT_SYNCED}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Message Sync Ongoing</TableCell>
      <TableCell align="right">{messageSync.ONGOING}</TableCell>
    </TableRow>
  </Table>
);
