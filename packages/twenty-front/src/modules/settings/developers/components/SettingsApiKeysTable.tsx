import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { SettingsPath } from '@/types/SettingsPath';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { useGetApiKeysQuery } from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${({ theme }) => theme.spacing(3)};
    display: flex;
    justify-content: space-between;
    scroll-behavior: smooth;
  }
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 312px auto 28px;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 95%;
    grid-template-columns: 20fr 2fr;
  }
`;

export const SettingsApiKeysTable = () => {
  const { data: apiKeysData } = useGetApiKeysQuery();

  const apiKeys = apiKeysData?.apiKeys;

  return (
    <Table>
      <StyledTableRow>
        <TableHeader>
          <Trans>Name</Trans>
        </TableHeader>
        <TableHeader>
          <Trans>Expiration</Trans>
        </TableHeader>
        <TableHeader></TableHeader>
      </StyledTableRow>
      {!!apiKeys?.length && (
        <StyledTableBody>
          {apiKeys.map((apiKey) => (
            <SettingsApiKeysFieldItemTableRow
              key={apiKey.id}
              apiKey={apiKey}
              to={getSettingsPath(SettingsPath.ApiKeyDetail, {
                apiKeyId: apiKey.id,
              })}
            />
          ))}
        </StyledTableBody>
      )}
    </Table>
  );
};
