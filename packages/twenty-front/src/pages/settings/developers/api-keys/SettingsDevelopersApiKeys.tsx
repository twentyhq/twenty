import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { objectSettingsWidth } from '@/settings/data-model/constants/objectSettings';
import { SettingsApiKeysFieldItemTableRow } from '@/settings/developers/components/SettingsApiKeysFieldItemTableRow';
import { ApiFieldItem } from '@/settings/developers/types/ApiFieldItem';
import { formatExpirations } from '@/settings/developers/utils/format-expiration';
import { IconPlus, IconSettings } from '@/ui/display/icon';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledContainer = styled.div`
  height: fit-content;
  padding: ${({ theme }) => theme.spacing(8)};
  width: ${objectSettingsWidth};
`;

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 180px 98.7px 98.7px 98.7px 36px;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsDevelopersApiKeys = () => {
  const navigate = useNavigate();

  const [apiKeys, setApiKeys] = useState<Array<ApiFieldItem>>([]);

  useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
    filter: { revokedAt: { is: 'NULL' } },
    orderBy: {},
    onCompleted: (data) => {
      setApiKeys(
        formatExpirations(
          data.edges.map((apiKey) => ({
            id: apiKey.node.id,
            name: apiKey.node.name,
            expiresAt: apiKey.node.expiresAt,
          })),
        ),
      );
    },
  });

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <StyledContainer>
        <StyledHeader>
          <StyledH1Title title="APIs" />
          <Button
            Icon={IconPlus}
            title="Create Key"
            accent="blue"
            size="small"
            onClick={() => {
              navigate('/settings/developers/api-keys/new');
            }}
          />
        </StyledHeader>
        <H2Title
          title="Active Keys"
          description="Active APIs keys created by you or your team"
        />
        <Table>
          <StyledTableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Expiration</TableHeader>
            <TableHeader></TableHeader>
          </StyledTableRow>
          {apiKeys.map((fieldItem) => (
            <SettingsApiKeysFieldItemTableRow
              key={fieldItem.id}
              fieldItem={fieldItem}
              onClick={() => {
                navigate(`/settings/developers/api-keys/${fieldItem.id}`);
              }}
            />
          ))}
        </Table>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
