import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';

export const RoleAssignmentTableHeader = () => (
  <Table>
    <TableRow gridAutoColumns="2fr 4fr">
      <TableHeader>{t`Name`}</TableHeader>
      <TableHeader>{t`Email`}</TableHeader>
    </TableRow>
  </Table>
);
