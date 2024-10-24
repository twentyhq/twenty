import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { ApiFieldItem } from '@/settings/developers/types/api-key/ApiFieldItem';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { formatExpirations } from '@/settings/developers/utils/formatExpiration';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui';

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
  const { records: apiKeys } = useFindManyRecords<ApiKey>({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
    filter: { revokedAt: { is: 'NULL' } },
  });

  return (
    <Table>
      <StyledTableRow>
        <TableHeader>Name</TableHeader>
        <TableHeader>Expiration</TableHeader>
        <TableHeader></TableHeader>
      </StyledTableRow>
      {!!apiKeys.length && (
        <StyledTableBody>
          {formatExpirations(apiKeys).map((fieldItem) => (
            <SettingsApiKeysFieldItemTableRow
              key={fieldItem.id}
              fieldItem={fieldItem as ApiFieldItem}
              to={`/settings/developers/api-keys/${fieldItem.id}`}
            />
          ))}
        </StyledTableBody>
      )}
    </Table>
  );
};
