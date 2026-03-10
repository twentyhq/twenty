import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
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

const StyledTableRowContainer = styled.div`
  > * > * {
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
  }
`;

const StyledTableCellFontWrapper = styled.div`
  display: contents;
  font-family: monospace;
`;

export const SettingsDnsRecordsTable = ({
  records,
}: SettingsDnsRecordsTableProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  if (records.length === 0) {
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
      <StyledTableRowContainer>
        <TableRow gridAutoColumns={gridAutoColumns}>
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
      </StyledTableRowContainer>

      {records.map((record) => (
        <StyledTableRowContainer key={record.value}>
          <TableRow gridAutoColumns={gridAutoColumns}>
            <TableCell>{record.type}</TableCell>
            <StyledTableCellFontWrapper>
              <TableCell
                onClick={() => {
                  copyToClipboard(record.key || '');
                }}
              >
                <OverflowingTextWithTooltip text={record.key} />
              </TableCell>
            </StyledTableCellFontWrapper>

            <StyledTableCellFontWrapper>
              <TableCell
                onClick={() => {
                  copyToClipboard(record.value);
                }}
              >
                <OverflowingTextWithTooltip text={record.value} />
              </TableCell>
            </StyledTableCellFontWrapper>

            {hasPriorityRecords && (
              <StyledTableCellFontWrapper>
                <TableCell>{record.priority}</TableCell>
              </StyledTableCellFontWrapper>
            )}
            {hasTtlRecords && (
              <StyledTableCellFontWrapper>
                <TableCell>{record.ttl}</TableCell>
              </StyledTableCellFontWrapper>
            )}
            {hasStatusRecords && (
              <StyledTableCellFontWrapper>
                <TableCell>
                  {'status' in record ? (
                    <Status
                      color={record.statusColor}
                      text={capitalize(record.status)}
                    />
                  ) : null}
                </TableCell>
              </StyledTableCellFontWrapper>
            )}
          </TableRow>
        </StyledTableRowContainer>
      ))}
    </Table>
  );
};
