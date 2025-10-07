import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip, Status } from 'twenty-ui/display';
import { type ThemeColor } from 'twenty-ui/theme';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type RecordStatus = {
  status: string;
  statusColor: ThemeColor;
};

type DnsRecordBase = {
  type: string;
  key: string;
  value: string;
  priority?: number | null;
  ttl?: string;
};

type DnsRecord = DnsRecordBase | (DnsRecordBase & RecordStatus);

type SettingsDnsRecordsTableProps = {
  records: DnsRecord[];
};

const StyledTableRow = styled(TableRow)`
  & > * {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }
`;

const StyledTableCell = styled(TableCell)`
  font-family: monospace;
`;

export const SettingsDnsRecordsTable = ({
  records,
}: SettingsDnsRecordsTableProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  if (!records || records.length === 0) {
    return null;
  }

  const hasTtlRecords = records.some((record) => isDefined(record.ttl));
  const hasStatusRecords = records.some((record) => 'status' in record);
  const hasPriorityRecords = records.some((record) =>
    isDefined(record.priority),
  );

  const buildGridColumns = () => {
    const baseColumns = ['max-content', '1fr', '1fr'];

    if (hasPriorityRecords) baseColumns.push('max-content');
    if (hasTtlRecords) baseColumns.push('max-content');
    if (hasStatusRecords) baseColumns.push('max-content');

    return baseColumns.join(' ');
  };

  const gridAutoColumns = buildGridColumns();

  return (
    <Table>
      <StyledTableRow gridAutoColumns={gridAutoColumns}>
        <TableHeader align="center">{t`Type`}</TableHeader>
        <TableHeader align="center">{t`Key`}</TableHeader>
        <TableHeader align="center">{t`Value`}</TableHeader>
        {hasPriorityRecords && (
          <TableHeader align="center">{t`Priority`}</TableHeader>
        )}
        {hasTtlRecords && <TableHeader align="center">{t`TTL`}</TableHeader>}
        {hasStatusRecords && (
          <TableHeader align="center">{t`Status`}</TableHeader>
        )}
      </StyledTableRow>

      {records.map((record) => (
        <StyledTableRow key={record.value} gridAutoColumns={gridAutoColumns}>
          <TableCell>{record.type}</TableCell>
          <StyledTableCell
            onClick={() => {
              copyToClipboard(record.key || '');
            }}
          >
            <OverflowingTextWithTooltip text={record.key} />
          </StyledTableCell>

          <StyledTableCell
            onClick={() => {
              copyToClipboard(record.value);
            }}
          >
            <OverflowingTextWithTooltip text={record.value} />
          </StyledTableCell>

          {hasPriorityRecords && (
            <StyledTableCell>{record.priority}</StyledTableCell>
          )}
          {hasTtlRecords && <StyledTableCell>{record.ttl}</StyledTableCell>}
          {hasStatusRecords && (
            <StyledTableCell>
              {'status' in record ? (
                <Status
                  color={record.statusColor}
                  text={capitalize(record.status)}
                />
              ) : null}
            </StyledTableCell>
          )}
        </StyledTableRow>
      ))}
    </Table>
  );
};
