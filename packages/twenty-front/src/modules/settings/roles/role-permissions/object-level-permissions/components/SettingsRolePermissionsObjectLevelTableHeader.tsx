import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';

export const SettingsRolePermissionsObjectLevelTableHeader = () => (
  <TableRow gridAutoColumns="180px 1fr 1fr">
    <TableHeader>{t`Object`}</TableHeader>
    <TableHeader>{t`Permissions`}</TableHeader>
    <TableHeader></TableHeader>
  </TableRow>
);
