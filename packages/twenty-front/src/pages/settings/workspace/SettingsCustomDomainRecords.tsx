import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { type ThemeColor } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';
import {
  type CustomDomainRecord,
  type CustomDomainValidRecords,
} from '~/generated/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { customDomainRecordsState } from '~/pages/settings/workspace/states/customDomainRecordsState';

const StyledTable = styled(Table)`
  border-bottom: 1px solid var(--border-color-light);
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
  display: block;
  padding: 0 var(--spacing-3) 0 0;

  &:first-of-type {
    padding-left: 0;
  }

  &:last-of-type {
    padding-right: 0;
  }
`;

const StyledButton = styled(Button)`
  border: 1px solid var(--border-color-medium);
  color: var(--font-color-tertiary);
  font-weight: var(--font-weight-regular);
  height: var(--spacing-6);
  overflow: hidden;
  user-select: text;
  width: 100%;
`;

export const SettingsCustomDomainRecords = ({
  records,
}: {
  records: CustomDomainValidRecords['records'];
}) => {
  const { customDomainRecords } = useRecoilValue(customDomainRecordsState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { copyToClipboard } = useCopyToClipboard();

  const copyToClipboardDebounced = useDebouncedCallback(
    (value: string) => copyToClipboard(value),
    200,
  );

  const rowsDefinitions = [
    { name: 'Domain Setup', validationType: 'redirection' as const },
    { name: 'Secure Connection', validationType: 'ssl' as const },
  ];

  const defaultValues: { status: string; color: ThemeColor } =
    currentWorkspace?.customDomain === customDomainRecords?.customDomain
      ? {
          status: 'success',
          color: 'green',
        }
      : {
          status: 'loading',
          color: 'gray',
        };

  const rows = rowsDefinitions.map<
    { name: string; status: string; color: ThemeColor } & CustomDomainRecord
  >((row) => {
    const record = records.find(
      ({ validationType }) => validationType === row.validationType,
    );

    if (!record) {
      throw new Error(`Record ${row.name} not found`);
    }

    return {
      name: row.name,
      color:
        record && record.status === 'error'
          ? 'red'
          : record && record.status === 'pending'
            ? 'yellow'
            : defaultValues.color,
      ...record,
    };
  });

  return (
    <StyledTable>
      <TableRow gridAutoColumns="30% 16% 38% 16%">
        <TableHeader>Name</TableHeader>
        <TableHeader>Type</TableHeader>
        <TableHeader>Value</TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      <TableBody>
        {rows.map((row) => (
          <TableRow gridAutoColumns="30% 16% 38% 16%" key={row.name}>
            <StyledTableCell>
              <StyledButton
                title={row.key}
                onClick={() => copyToClipboardDebounced(row.key)}
                type="button"
              />
            </StyledTableCell>
            <StyledTableCell>
              <StyledButton
                title={row.type.toUpperCase()}
                onClick={() => copyToClipboardDebounced(row.type.toUpperCase())}
                type="button"
              />
            </StyledTableCell>
            <StyledTableCell>
              <StyledButton
                title={row.value}
                onClick={() => copyToClipboardDebounced(row.value)}
                type="button"
              />
            </StyledTableCell>
            <StyledTableCell>
              <Status color={row.color} text={capitalize(row.status)} />
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );
};
