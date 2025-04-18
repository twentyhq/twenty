import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';

export const SettingsRolePermissionsObjectLevelObjectFormObjectLevelHeader =
  () => (
    <TableRow gridAutoColumns="1fr 24px">
      <TableHeader>{t`Name`}</TableHeader>
      <TableHeader aria-label={t`Actions`}></TableHeader>
    </TableRow>
  );
