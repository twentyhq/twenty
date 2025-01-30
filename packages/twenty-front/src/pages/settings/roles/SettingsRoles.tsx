import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Button, H2Title, IconPlus, IconSearch, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledSearchInput = styled(TextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledRoleTableRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const GET_SETTINGS_ROLE_TABLE_METADATA = {
  tableId: 'settingsRole',
  fields: [
    {
      fieldName: 'name',
      fieldLabel: 'Name',
      align: 'left' as const,
    },
    {
      fieldName: 'assignedTo',
      fieldLabel: 'Assigned to',
      align: 'left' as const,
    },
  ],
  initialSort: {
    fieldName: 'name',
    orderBy: 'AscNullsLast' as const,
  } satisfies TableSortValue,
};

export const SettingsRoles = () => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const isPermissionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );

  if (!isPermissionsEnabled) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={t`Roles`}
      actionButton={
        <Button
          Icon={IconPlus}
          title={t`Add role`}
          accent="blue"
          size="small"
        />
      }
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Roles</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`All roles`} />

          <StyledSearchInput
            LeftIcon={IconSearch}
            placeholder={t`Search a role...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />

          <Table>
            <StyledRoleTableRow>
              {GET_SETTINGS_ROLE_TABLE_METADATA.fields.map(
                (settingsRoleTableMetadataField) => (
                  <SortableTableHeader
                    key={settingsRoleTableMetadataField.fieldName}
                    fieldName={settingsRoleTableMetadataField.fieldName}
                    label={settingsRoleTableMetadataField.fieldLabel}
                    tableId={GET_SETTINGS_ROLE_TABLE_METADATA.tableId}
                    align={settingsRoleTableMetadataField.align}
                    initialSort={GET_SETTINGS_ROLE_TABLE_METADATA.initialSort}
                  />
                ),
              )}
            </StyledRoleTableRow>
          </Table>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
