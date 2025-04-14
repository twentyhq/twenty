import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';

export const SettingsRolePermissionsObjectLevelTableHeader = () => (
  <TableRow>
    <TableHeader>{t`Object`}</TableHeader>
    <TableHeader>{t`Permission overrides`}</TableHeader>
    <TableHeader></TableHeader>
  </TableRow>
);
