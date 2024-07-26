import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { useGetManyServerlessFunctions } from '@/settings/serverless-functions/hooks/useGetManyServerlessFunctions';
import { SettingsServerlessFunctionsFieldItemTableRow } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsFieldItemTableRow';
import { ServerlessFunction } from '~/generated-metadata/graphql';
import { SettingsServerlessFunctionsTableEmpty } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTableEmpty';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 312px 132px 68px;
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsServerlessFunctionsTable = () => {
  const { serverlessFunctions } = useGetManyServerlessFunctions();
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
                  to={getSettingsPagePath(SettingsPath.ServerlessFunctions, {
                    id: serverlessFunction.id,
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
