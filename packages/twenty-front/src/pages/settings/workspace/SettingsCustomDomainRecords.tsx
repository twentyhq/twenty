import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { Button } from 'twenty-ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { CustomDomainValidRecords } from '~/generated/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledTable = styled(Table)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
  display: block;
  padding: 0 ${({ theme }) => theme.spacing(3)} 0 0;

  &:first-of-type {
    padding-left: 0;
  }

  &:last-of-type {
    padding-right: 0;
  }
`;

const StyledButton = styled(Button)`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  height: ${({ theme }) => theme.spacing(6)};
  overflow: hidden;
  user-select: text;
  width: 100%;
`;

export const SettingsCustomDomainRecords = ({
  records,
}: {
  records: CustomDomainValidRecords['records'];
}) => {
  const { copyToClipboard } = useCopyToClipboard();

  const copyToClipboardDebounced = useDebouncedCallback(
    (value: string) => copyToClipboard(value),
    200,
  );

  return (
    <StyledTable>
      <TableRow gridAutoColumns="35% 16% auto">
        <TableHeader>Name</TableHeader>
        <TableHeader>Type</TableHeader>
        <TableHeader>Value</TableHeader>
      </TableRow>
      <TableBody>
        {records
          .filter((record) => record.status !== 'success')
          .map((record) => (
            <TableRow gridAutoColumns="30% 16% auto" key={record.key}>
              <StyledTableCell>
                <StyledButton
                  title={record.key}
                  onClick={() => copyToClipboardDebounced(record.key)}
                  type="button"
                />
              </StyledTableCell>
              <StyledTableCell>
                <StyledButton
                  title={record.type.toUpperCase()}
                  onClick={() =>
                    copyToClipboardDebounced(record.type.toUpperCase())
                  }
                  type="button"
                />
              </StyledTableCell>
              <StyledTableCell>
                <StyledButton
                  title={record.value}
                  onClick={() => copyToClipboardDebounced(record.value)}
                  type="button"
                />
              </StyledTableCell>
            </TableRow>
          ))}
      </TableBody>
    </StyledTable>
  );
};
