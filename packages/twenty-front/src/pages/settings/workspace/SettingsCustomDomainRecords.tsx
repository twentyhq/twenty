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

const StyledTable = styled(Table)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledButton = styled(Button)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  height: ${({ theme }) => theme.spacing(7)};
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  width: 100%;
  overflow: hidden;
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
              <TableCell>
                <StyledButton
                  title={record.key}
                  onClick={() => copyToClipboard(record.key)}
                />
              </TableCell>
              <TableCell>
                <StyledButton
                  title={record.type.toUpperCase()}
                  onClick={() => copyToClipboard(record.type.toUpperCase())}
                />
              </TableCell>
              <TableCell>
                <StyledButton
                  title={record.value}
                  onClick={() => copyToClipboard(record.value)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </StyledTable>
  );
};
