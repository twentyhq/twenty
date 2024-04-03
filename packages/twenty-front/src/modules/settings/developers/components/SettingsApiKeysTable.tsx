import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { ApiFieldItem } from '@/settings/developers/types/api-key/ApiFieldItem';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { formatExpirations } from '@/settings/developers/utils/format-expiration';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 312px 132px 68px;
`;

export const SettingsApiKeysTable = () => {
  const navigate = useNavigate();

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
              onClick={() => {
                navigate(`/settings/developers/api-keys/${fieldItem.id}`);
              }}
            />
          ))}
        </StyledTableBody>
      )}
    </Table>
  );
};
