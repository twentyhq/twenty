import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import { GetApiKeysDocument } from '~/generated-metadata/graphql';

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const SettingsApiKeysTable = () => {
  const { data: apiKeysData } = useQuery(GetApiKeysDocument);

  const apiKeys = apiKeysData?.apiKeys;

  const gridAutoColumns = '5fr 2fr 3fr 1fr';

  return (
    <Table>
      <TableRow gridAutoColumns={gridAutoColumns}>
        <TableHeader>
          <Trans>Name</Trans>
        </TableHeader>
        <TableHeader>
          <Trans>Role</Trans>
        </TableHeader>
        <TableHeader>
          <Trans>Expiration</Trans>
        </TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      {!!apiKeys?.length && (
        <StyledTableBodyContainer>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <SettingsApiKeysFieldItemTableRow
                key={apiKey.id}
                apiKey={apiKey}
                to={getSettingsPath(SettingsPath.ApiKeyDetail, {
                  apiKeyId: apiKey.id,
                })}
              />
            ))}
          </TableBody>
        </StyledTableBodyContainer>
      )}
    </Table>
  );
};
