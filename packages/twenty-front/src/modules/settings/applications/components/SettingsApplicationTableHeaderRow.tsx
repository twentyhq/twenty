import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';
import { getApplicationTableRowGridTemplateColumns } from '@/settings/applications/utils/getApplicationTableRowGridTemplateColumns';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { useIsMobile } from 'twenty-ui/utilities';

type SettingsApplicationTableHeaderRowProps = {
  middleColumn: SettingsApplicationTableRowMiddleColumn;
};

export const SettingsApplicationTableHeaderRow = ({
  middleColumn,
}: SettingsApplicationTableHeaderRowProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  return (
    <TableRow
      gridTemplateColumns={getApplicationTableRowGridTemplateColumns({
        middleColumn,
        isMobile,
      })}
    >
      <TableHeader>{t`Name`}</TableHeader>
      <TableHeader>
        {middleColumn === 'status' ? t`Status` : t`Type`}
      </TableHeader>
      {!isMobile && <TableHeader>{t`Description`}</TableHeader>}
      <TableHeader />
    </TableRow>
  );
};
