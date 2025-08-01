import { OBJECT_LEVEL_PERMISSION_TABLE_GRID_AUTO_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/constants/ObjectLevelPermissionTableGridAutoColumns';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';

export const SettingsRolePermissionsObjectLevelTableHeader = () => (
  <TableRow gridAutoColumns={OBJECT_LEVEL_PERMISSION_TABLE_GRID_AUTO_COLUMNS}>
    <TableHeader>{t`Object`}</TableHeader>
    <TableHeader>{t`Permissions`}</TableHeader>
    <TableHeader>{t`See Fields`}</TableHeader>
    <TableHeader>{t`Edit Fields`}</TableHeader>
    <TableHeader></TableHeader>
  </TableRow>
);
