import { Table } from '@/ui/layout/table/components/Table';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import styled from '@emotion/styled';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { customDomainRecordsState } from '~/pages/settings/workspace/states/customDomainRecordsState';
import { useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/display';
import { ThemeColor } from 'twenty-ui/theme';

const StyledTable = styled(Table)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledTableRow = styled(TableRow)`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  &:last-child {
    border-bottom: none;
  }
`;

const StyledTableCell = styled(TableCell)`
  padding: 0;
`;

const records = [
  { name: 'CNAME', validationType: 'redirection' as const },
  { name: 'TXT Validation', validationType: 'ownership' as const },
  { name: 'SSL Certificate Generation', validationType: 'ssl' as const },
];

export const SettingsCustomDomainRecordsStatus = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { customDomainRecords } = useRecoilValue(customDomainRecordsState);

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

  const rows = records.map<{ name: string; status: string; color: ThemeColor }>(
    (record) => {
      const foundRecord = customDomainRecords?.records.find(
        ({ validationType }) => validationType === record.validationType,
      );
      return {
        name: record.name,
        status: foundRecord ? foundRecord.status : defaultValues.status,
        color:
          foundRecord && foundRecord.status === 'error'
            ? 'red'
            : foundRecord && foundRecord.status === 'pending'
              ? 'yellow'
              : defaultValues.color,
      };
    },
  );

  return (
    <StyledTable>
      {rows.map((row) => (
        <StyledTableRow key={row.name}>
          <StyledTableCell>{row.name}</StyledTableCell>
          <StyledTableCell>
            <Status color={row.color} text={capitalize(row.status)} />
          </StyledTableCell>
        </StyledTableRow>
      ))}
    </StyledTable>
  );
};
