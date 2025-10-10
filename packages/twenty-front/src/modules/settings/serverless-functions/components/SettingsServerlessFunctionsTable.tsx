import { SettingsServerlessFunctionsFieldItemTableRow } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsFieldItemTableRow';
import { SettingsServerlessFunctionsTableEmpty } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTableEmpty';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { type ServerlessFunction } from '~/generated-metadata/graphql';

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 312px 132px 68px;
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsServerlessFunctionsTable = ({
  serverlessFunctions,
}: {
  serverlessFunctions: ServerlessFunction[];
}) => {
  return (
    <>
      {serverlessFunctions.length ? (
        <Table>
          <StyledTableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Runtime</TableHeader>
            <TableHeader></TableHeader>
          </StyledTableRow>
          <StyledTableBody>
            {serverlessFunctions.map(
              (serverlessFunction: ServerlessFunction) => (
                <SettingsServerlessFunctionsFieldItemTableRow
                  key={serverlessFunction.id}
                  serverlessFunction={serverlessFunction}
                  to={getSettingsPath(SettingsPath.ServerlessFunctionDetail, {
                    serverlessFunctionId: serverlessFunction.id,
                  })}
                />
              ),
            )}
          </StyledTableBody>
        </Table>
      ) : (
        <SettingsServerlessFunctionsTableEmpty />
      )}
    </>
  );
};
