import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

export const SettingsAdminHealthMessageSyncCountersTable = ({
  details,
}: {
  details: string | null | undefined;
}) => {
  const parsedDetails = details ? JSON.parse(details) : null;
  if (!parsedDetails) {
    return null;
  }

  return (
    <Table>
      <TableRow>
        <TableHeader>Status</TableHeader>
        <TableHeader align="right">Count</TableHeader>
      </TableRow>
      <TableRow>
        <TableCell>Message Not Synced</TableCell>
        <TableCell align="right">{parsedDetails.counters.NOT_SYNCED}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Message Sync Ongoing</TableCell>
        <TableCell align="right">{parsedDetails.counters.ONGOING}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Total Jobs</TableCell>
        <TableCell align="right">{parsedDetails.totalJobs}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Failed Jobs</TableCell>
        <TableCell align="right">{parsedDetails.failedJobs}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Failure Rate</TableCell>
        <TableCell align="right">{parsedDetails.failureRate}%</TableCell>
      </TableRow>
    </Table>
  );
};
