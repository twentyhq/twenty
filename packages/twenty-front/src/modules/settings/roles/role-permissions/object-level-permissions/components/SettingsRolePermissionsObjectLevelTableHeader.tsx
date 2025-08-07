import { OBJECT_LEVEL_PERMISSION_TABLE_GRID_AUTO_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/constants/ObjectLevelPermissionTableGridAutoColumns';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';

type SettingsRolePermissionsObjectLevelTableHeaderProps = {
  showPermissionsLabel?: boolean;
};

export const SettingsRolePermissionsObjectLevelTableHeader = ({
  showPermissionsLabel = true,
}: SettingsRolePermissionsObjectLevelTableHeaderProps) => (
  <TableRow gridAutoColumns={OBJECT_LEVEL_PERMISSION_TABLE_GRID_AUTO_COLUMNS}>
    <TableHeader>{t`Object-Level`}</TableHeader>
    <TableHeader>{showPermissionsLabel ? t`Permissions` : ''}</TableHeader>
    <TableHeader>{showPermissionsLabel ? t`See Fields` : ''}</TableHeader>
    <TableHeader>{showPermissionsLabel ? t`Edit Fields` : ''}</TableHeader>
    <TableHeader></TableHeader>
  </TableRow>
);
