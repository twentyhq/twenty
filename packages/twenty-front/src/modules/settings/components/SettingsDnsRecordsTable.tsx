import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { css } from '@linaria/core';
import { t } from '@lingui/core/macro';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip, Status } from 'twenty-ui/display';
import { type ThemeColor } from 'twenty-ui/theme-constants';
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

const dnsRecordTableRowClassName = css`
  & > * {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }
`;

const StyledMonospaceCell = styled.div`
  display: contents;
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
      <TableRow
        gridAutoColumns={gridAutoColumns}
        className={dnsRecordTableRowClassName}
      >
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
      </TableRow>

      {records.map((record) => (
        <TableRow
          key={record.value}
          gridAutoColumns={gridAutoColumns}
          className={dnsRecordTableRowClassName}
        >
          <TableCell>{record.type}</TableCell>
          <TableCell
            onClick={() => {
              copyToClipboard(record.key || '');
            }}
          >
            <StyledMonospaceCell>
              <OverflowingTextWithTooltip text={record.key} />
            </StyledMonospaceCell>
          </TableCell>

          <TableCell
            onClick={() => {
              copyToClipboard(record.value);
            }}
          >
            <StyledMonospaceCell>
              <OverflowingTextWithTooltip text={record.value} />
            </StyledMonospaceCell>
          </TableCell>

          {hasPriorityRecords && (
            <TableCell>
              <StyledMonospaceCell>{record.priority}</StyledMonospaceCell>
            </TableCell>
          )}
          {hasTtlRecords && (
            <TableCell>
              <StyledMonospaceCell>{record.ttl}</StyledMonospaceCell>
            </TableCell>
          )}
          {hasStatusRecords && (
            <TableCell>
              <StyledMonospaceCell>
                {'status' in record ? (
                  <Status
                    color={record.statusColor}
                    text={capitalize(record.status)}
                  />
                ) : null}
              </StyledMonospaceCell>
            </TableCell>
          )}
        </TableRow>
      ))}
    </Table>
  );
};
