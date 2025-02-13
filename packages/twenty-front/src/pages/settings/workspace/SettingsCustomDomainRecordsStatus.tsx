import { Table } from '@/ui/layout/table/components/Table';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { Status, ThemeColor } from 'twenty-ui';
import styled from '@emotion/styled';
import { CustomDomainValidRecords } from '~/generated/graphql';

const StyledTable = styled(Table)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRow = styled(TableRow)`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  align-items: center;
  justify-content: space-between;
  &:last-child {
    border-bottom: none;
  }
`;

export const SettingsCustomDomainRecordsStatus = ({
  records,
}: {
  records: CustomDomainValidRecords['records'];
}) => {
  const rows = records.reduce(
    (acc, record) => {
      acc[record.validationType] = {
        name: acc[record.validationType].name,
        status: record.status,
        color:
          record.status === 'error'
            ? 'red'
            : record.status === 'pending'
              ? 'yellow'
              : 'green',
      };
      return acc;
    },
    {
      ssl: {
        name: 'SSL',
        status: 'success',
        color: 'green',
      },
      redirection: {
        name: 'Redirection',
        status: 'success',
        color: 'green',
      },
      ownership: {
        name: 'Ownership',
        status: 'success',
        color: 'green',
      },
    } as Record<string, { name: string; status: string; color: ThemeColor }>,
  );

  return (
    <StyledTable>
      {Object.values(rows).map((row) => {
        return (
          <StyledTableRow>
            <TableCell>{row.name}</TableCell>
            <TableCell>
              <Status color={row.color} text={row.status} />
            </TableCell>
          </StyledTableRow>
        );
      })}
    </StyledTable>
  );
};
