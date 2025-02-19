import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { H2Title } from 'twenty-ui';

const StyledContainer = styled.div``;

export const SettingsAdminHealthAccountSyncCountersTable = ({
  details,
  title,
}: {
  details: Record<string, any> | null;
  title: string;
}) => {
  if (!details) {
    return null;
  }

  return (
    <StyledContainer>
      <H2Title
        title={title}
        description={`How your ${title.toLowerCase()} is doing`}
      />
      <Table>
        <TableRow>
          <TableHeader>Status</TableHeader>
          <TableHeader align="right">Count</TableHeader>
        </TableRow>
        <TableRow>
          <TableCell>Not Synced</TableCell>
          <TableCell align="right">{details.counters.NOT_SYNCED}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Sync Ongoing</TableCell>
          <TableCell align="right">{details.counters.ONGOING}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Total Jobs</TableCell>
          <TableCell align="right">{details.totalJobs}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Failed Jobs</TableCell>
          <TableCell align="right">{details.failedJobs}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Failure Rate</TableCell>
          <TableCell align="right">{details.failureRate}%</TableCell>
        </TableRow>
      </Table>
    </StyledContainer>
  );
};
