import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { SettingsPath } from '@/types/SettingsPath';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import {
  FeatureFlagKey,
  useGetApiKeysQuery,
} from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsApiKeysTable = () => {
  const isApiKeyRolesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_API_KEY_ROLES_ENABLED,
  );

  const { data: apiKeysData } = useGetApiKeysQuery();

  const apiKeys = apiKeysData?.apiKeys;

  const gridAutoColumns = isApiKeyRolesEnabled
    ? '5fr 2fr 3fr 1fr'
    : '5fr 3fr 1fr';

  return (
    <Table>
      <TableRow gridAutoColumns={gridAutoColumns}>
        <TableHeader>
          <Trans>Name</Trans>
        </TableHeader>
        {isApiKeyRolesEnabled && (
          <TableHeader>
            <Trans>Role</Trans>
          </TableHeader>
        )}
        <TableHeader>
          <Trans>Expiration</Trans>
        </TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
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
