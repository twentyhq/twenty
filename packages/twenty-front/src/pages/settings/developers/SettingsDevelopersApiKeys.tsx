import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { ApiFieldItem } from '@/settings/developers/types/ApiFieldItem';
import { ApiKey } from '@/settings/developers/types/ApiKey';
import { formatExpirations } from '@/settings/developers/utils/format-expiration';
import { IconPlus } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 312px 132px 68px;
`;

const StyledTableBody = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const SettingsDevelopersApiKeys = () => {
  const navigate = useNavigate();

  const { records: apiKeys } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
    filter: { revokedAt: { is: 'NULL' } },
    orderBy: {},
  });

  return (
    <Section>
      <H2Title
        title="API keys"
        description="Active APIs keys created by you or your team."
      />
      <Table>
        <StyledTableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Expiration</TableHeader>
          <TableHeader></TableHeader>
        </StyledTableRow>
        {!!apiKeys.length && (
          <StyledTableBody>
            {formatExpirations(apiKeys as ApiKey[]).map((fieldItem) => (
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
      <StyledDiv>
        <Button
          Icon={IconPlus}
          title="Create API key"
          size="small"
          variant="secondary"
          onClick={() => {
            navigate('/settings/developers/api-keys/new');
          }}
        />
      </StyledDiv>
    </Section>
  );
};
