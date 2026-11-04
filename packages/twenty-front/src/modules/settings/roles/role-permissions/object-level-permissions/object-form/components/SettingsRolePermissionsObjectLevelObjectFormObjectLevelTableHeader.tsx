import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';

export const SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableHeader =
  () => {
    const { t } = useLingui();
    return (
      <TableRow gridAutoColumns="1fr 48px">
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader aria-label={t`Actions`}></TableHeader>
      </TableRow>
    );
  };
