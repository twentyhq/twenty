import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Status } from 'twenty-ui';
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
      <TableCell>
        <Status color="orange" text="Not Synced" weight="medium" />
      </TableCell>
      <TableCell align="right">{messageSync.NOT_SYNCED}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>
        <Status
          color="turquoise"
          text="Ongoing"
          weight="medium"
          isLoaderVisible
        />
      </TableCell>
      <TableCell align="right">{messageSync.ONGOING}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>
        <Status color="green" text="Active" weight="medium" />
      </TableCell>
      <TableCell align="right">{messageSync.ACTIVE}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>
        <Status color="red" text="Failed (Permissions)" weight="medium" />
      </TableCell>
      <TableCell align="right">
        {messageSync.FAILED_INSUFFICIENT_PERMISSIONS}
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell>
        <Status color="red" text="Failed (Unknown)" weight="medium" />
      </TableCell>
      <TableCell align="right">{messageSync.FAILED_UNKNOWN}</TableCell>
    </TableRow>
  </Table>
);
