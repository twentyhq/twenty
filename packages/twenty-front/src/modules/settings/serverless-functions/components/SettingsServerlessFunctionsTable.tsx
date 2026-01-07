import { SettingsServerlessFunctionsFieldItemTableRow } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsFieldItemTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { type ServerlessFunction } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';

export const StyledTableRow = styled(TableRow)`
  grid-template-columns: 164px 1fr 96px 32px;
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsServerlessFunctionsTable = ({
  serverlessFunctions,
}: {
  serverlessFunctions: ServerlessFunction[];
}) => {
  const { applicationId = '' } = useParams();

  const { t } = useLingui();

  if (serverlessFunctions.length === 0) {
    return null;
  }

  return (
    <Table>
      <StyledTableRow>
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader></TableHeader>
        <TableHeader>{t`Runtime`}</TableHeader>
        <TableHeader></TableHeader>
      </StyledTableRow>
      <StyledTableBody>
        {serverlessFunctions.map((serverlessFunction: ServerlessFunction) => (
          <SettingsServerlessFunctionsFieldItemTableRow
            key={serverlessFunction.id}
            serverlessFunction={serverlessFunction}
            to={getSettingsPath(
              SettingsPath.ApplicationServerlessFunctionDetail,
              {
                applicationId,
                serverlessFunctionId: serverlessFunction.id,
              },
            )}
          />
        ))}
      </StyledTableBody>
    </Table>
  );
};
