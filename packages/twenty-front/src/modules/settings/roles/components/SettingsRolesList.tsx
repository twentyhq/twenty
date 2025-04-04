import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { SettingsRolesTableHeader } from '@/settings/roles/components/SettingsRolesTableHeader';
import { SettingsRolesTableRow } from '@/settings/roles/components/SettingsRolesTableRow';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { SettingsPath } from '@/types/SettingsPath';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { Button } from 'twenty-ui/input';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledCreateRoleSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledNoRoles = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsRolesList = () => {
  const navigateSettings = useNavigateSettings();
  const isPermissionsV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsV2Enabled,
  );

  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);

  return (
    <Section>
      <H2Title
        title={t`All roles`}
        description={t`Assign roles to specify each member's access permissions`}
      />
      <Table>
        <SettingsRolesTableHeader />
        <StyledTableRows>
          {settingsAllRoles.length === 0 ? (
            <StyledNoRoles>{t`No roles found`}</StyledNoRoles>
          ) : (
            settingsAllRoles.map((role) => (
              <SettingsRolesTableRow key={role.id} role={role} />
            ))
          )}
        </StyledTableRows>
      </Table>
      <StyledCreateRoleSection>
        <Button
          Icon={IconPlus}
          title={t`Create Role`}
          variant="secondary"
          size="small"
          soon={!isPermissionsV2Enabled}
          disabled={!isPermissionsV2Enabled}
          onClick={() => navigateSettings(SettingsPath.RoleCreate)}
        />
      </StyledCreateRoleSection>
    </Section>
  );
};
