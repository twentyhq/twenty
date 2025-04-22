import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useDebouncedCallback } from 'use-debounce';
import { CustomDomainValidRecords } from '~/generated/graphql';
import { useTheme } from '@emotion/react';
import { Button } from 'twenty-ui/input';
import { IconCopy } from 'twenty-ui/display';

const StyledTable = styled(Table)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
  display: block;
  padding: 0 ${({ theme }) => theme.spacing(3)} 0 0;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
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
  const { enqueueSnackBar } = useSnackBar();

  const theme = useTheme();

  const { t } = useLingui();

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    enqueueSnackBar(t`Copied to clipboard!`, {
      variant: SnackBarVariant.Success,
      icon: <IconCopy size={theme.icon.size.md} />,
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
        {records.map((record) => (
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
