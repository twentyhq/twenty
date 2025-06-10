import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';

export const SettingsRolePermissionsSettingsTableHeader = () => (
  <TableRow gridAutoColumns="3fr 4fr 24px">
    <TableHeader>{t`Name`}</TableHeader>
    <TableHeader>{t`Description`}</TableHeader>
    <TableHeader></TableHeader>
  </TableRow>
);
