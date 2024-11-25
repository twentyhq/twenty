import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { H2Title, Section } from 'twenty-ui';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledTableHeaderRow = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledTextContainerWithEllipsis = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsAdminFeatureFlags = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return (
    <Section>
      <H2Title title="Feature Flags" description="Manage feature flags." />

      <Table>
        <StyledTableHeaderRow>
          <TableRow
            gridAutoColumns="1fr 100px"
            mobileGridAutoColumns="1fr 80px"
          >
            <TableHeader>Feature Flag</TableHeader>
            <TableHeader>Value</TableHeader>
          </TableRow>
        </StyledTableHeaderRow>
        {currentWorkspace?.featureFlags?.map((flag) => (
          <StyledTable key={flag.key}>
            <TableRow
              gridAutoColumns="1fr 100px"
              mobileGridAutoColumns="1fr 80px"
            >
              <TableCell>
                <StyledTextContainerWithEllipsis id={`hover-text-${flag.key}`}>
                  {flag.key}
                </StyledTextContainerWithEllipsis>
              </TableCell>
              <TableCell>{flag.value ? 'Enabled' : 'Disabled'}</TableCell>
            </TableRow>
          </StyledTable>
        ))}
      </Table>
    </Section>
  );
};
