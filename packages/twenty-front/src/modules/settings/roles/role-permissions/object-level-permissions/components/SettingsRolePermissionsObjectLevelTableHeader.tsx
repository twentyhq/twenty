import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';

type SettingsRolePermissionsObjectLevelTableHeaderProps = {
  showPermissionsLabel?: boolean;
};

export const SettingsRolePermissionsObjectLevelTableHeader = ({
  showPermissionsLabel = true,
}: SettingsRolePermissionsObjectLevelTableHeaderProps) => (
  <TableRow gridAutoColumns="180px 1fr 1fr">
    <TableHeader>{t`Object-Level`}</TableHeader>
    <TableHeader>{showPermissionsLabel ? t`Permissions` : ''}</TableHeader>
    <TableHeader></TableHeader>
  </TableRow>
);
