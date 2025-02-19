import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { Button } from 'twenty-ui';
import { Table } from '@/ui/layout/table/components/Table';
import { CustomDomainValidRecords } from '~/generated/graphql';
import styled from '@emotion/styled';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useDebouncedCallback } from 'use-debounce';

const StyledTable = styled(Table)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
`;

const StyledButton = styled(Button)`
  -moz-user-select: text;
  -ms-user-select: text;
  -webkit-user-select: text;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  height: ${({ theme }) => theme.spacing(7)};
  overflow: hidden;
  user-select: text;
  width: 100%;
`;

export const SettingsCustomDomainRecords = ({
  records,
}: {
  records: CustomDomainValidRecords['records'];
}) => {
  const { enqueueSnackBar } = useSnackBar();

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    enqueueSnackBar('Copied to clipboard!', {
      variant: SnackBarVariant.Success,
    });
  };

  const copyToClipboardDebounced = useDebouncedCallback(copyToClipboard, 200);

  return (
    <StyledTable>
      <TableRow gridAutoColumns="35% 16% auto">
        <TableHeader>Name</TableHeader>
        <TableHeader>Type</TableHeader>
        <TableHeader>Value</TableHeader>
      </TableRow>
      <TableBody>
        {records.map((record) => {
          return (
            <TableRow gridAutoColumns="30% 16% auto" key={record.key}>
              <StyledTableCell>
                <StyledButton
                  title={record.key}
                  onClick={() => copyToClipboardDebounced(record.key)}
                />
              </StyledTableCell>
              <StyledTableCell>
                <StyledButton
                  title={record.type.toUpperCase()}
                  onClick={() =>
                    copyToClipboardDebounced(record.type.toUpperCase())
                  }
                />
              </StyledTableCell>
              <StyledTableCell>
                <StyledButton
                  title={record.value}
                  onClick={() => copyToClipboardDebounced(record.value)}
                />
              </StyledTableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </StyledTable>
  );
};
