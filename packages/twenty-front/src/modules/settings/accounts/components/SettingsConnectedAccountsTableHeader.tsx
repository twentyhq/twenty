import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Trans } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const SettingsConnectedAccountsTableHeader = () => {
  return (
    <Table>
      <TableRow gridAutoColumns="332px 1fr">
        <TableHeader
          padding={`0 ${themeCssVariables.spacing[14]} 0 ${themeCssVariables.spacing[2]}`}
        >
          <Trans>Account</Trans>
        </TableHeader>
        <TableHeader
          align="right"
          padding={`0 ${themeCssVariables.spacing[14]} 0 ${themeCssVariables.spacing[2]}`}
        >
          <Trans>Status</Trans>
        </TableHeader>
      </TableRow>
    </Table>
  );
};
