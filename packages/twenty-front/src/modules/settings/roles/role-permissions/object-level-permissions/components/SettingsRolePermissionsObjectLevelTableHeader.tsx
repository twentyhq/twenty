import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';

export const SettingsRolePermissionsObjectLevelTableHeader = () => (
  <TableRow gridAutoColumns="3fr 3fr 24px">
    <TableHeader>{t`Object`}</TableHeader>
    <TableHeader>{t`Permission override`}</TableHeader>
    <TableHeader></TableHeader>
  </TableRow>
);
