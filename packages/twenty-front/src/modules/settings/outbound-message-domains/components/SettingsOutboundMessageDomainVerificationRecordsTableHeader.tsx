import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';

export const SettingsOutboundMessageDomainVerificationRecordsTableHeader =
  () => {
    const { t } = useLingui();

    return (
      <Table>
        <TableRow gridAutoColumns="80px 2fr 3fr 80px 80px">
          <TableHeader>{t`Type`}</TableHeader>
          <TableHeader>{t`Host / Name`}</TableHeader>
          <TableHeader>{t`Value`}</TableHeader>
          <TableHeader>{t`Priority`}</TableHeader>
          <TableHeader>{t`TTL`}</TableHeader>
        </TableRow>
      </Table>
    );
  };
