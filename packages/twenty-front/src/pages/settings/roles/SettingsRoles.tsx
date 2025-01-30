import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, H2Title, IconPlus, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledRoleTableRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

export const SettingsRoles = () => {
  const { t } = useLingui();
  const isPermissionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );

  const GET_SETTINGS_ROLE_TABLE_METADATA = {
    tableId: 'settingsRole',
    fields: [
      {
        fieldName: 'name',
        fieldLabel: t`Name`,
        align: 'left' as const,
      },
      {
        fieldName: 'assignedTo',
        fieldLabel: t`Assigned to`,
        align: 'left' as const,
      },
    ],
  };

  if (!isPermissionsEnabled) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={t`Roles`}
      actionButton={
        <Button
          Icon={IconPlus}
          title={t`New Role`}
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
          <H2Title
            title={t`All roles`}
            description={t`Assign roles to specify each member's access permissions`}
          />

          <Table>
            <StyledRoleTableRow>
              {GET_SETTINGS_ROLE_TABLE_METADATA.fields.map(
                (settingsRoleTableMetadataField) => (
                  <TableHeader
                    key={settingsRoleTableMetadataField.fieldName}
                    align={settingsRoleTableMetadataField.align}
                  >
                    {settingsRoleTableMetadataField.fieldLabel}
                  </TableHeader>
                ),
              )}
            </StyledRoleTableRow>
          </Table>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
