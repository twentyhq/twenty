import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { useGetOneServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctions';
import { SettingsServerlessFunctionsFieldItemTableRow } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsFieldItemTableRow';
import { ServerlessFunction } from '~/generated-metadata/graphql';

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 312px 132px 68px;
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsServerlessFunctionsTable = () => {
  const { serverlessFunctions } = useGetOneServerlessFunctions();
  return (
    <Table>
      <StyledTableRow>
        <TableHeader>Name</TableHeader>
        <TableHeader>Runtime</TableHeader>
        <TableHeader></TableHeader>
      </StyledTableRow>
      {!!serverlessFunctions.length && (
        <StyledTableBody>
          {serverlessFunctions.map((serverlessFunction: ServerlessFunction) => (
            <SettingsServerlessFunctionsFieldItemTableRow
              key={serverlessFunction.id}
              serverlessFunction={serverlessFunction}
              to={`/settings/functions/${serverlessFunction.id}`}
            />
          ))}
        </StyledTableBody>
      )}
    </Table>
  );
};
