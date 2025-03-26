import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { SettingsRolesTableHeader } from '@/settings/roles/components/SettingsRolesTableHeader';
import { SettingsRolesTableRow } from '@/settings/roles/components/SettingsRolesTableRow';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Button, H2Title, IconPlus, Section } from 'twenty-ui';
import { Role } from '~/generated-metadata/graphql';
import { FeatureFlagKey } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

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

export const SettingsRolesList = ({ roles }: { roles: Role[] }) => {
  const navigateSettings = useNavigateSettings();
  const isPermissionsV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsV2Enabled,
  );

  return (
    <Section>
      <H2Title
        title={t`All roles`}
        description={t`Assign roles to specify each member's access permissions`}
      />
      <Table>
        <SettingsRolesTableHeader />
        <StyledTableRows>
          {roles.map((role) => (
            <SettingsRolesTableRow key={role.id} role={role} />
          ))}
        </StyledTableRows>
      </Table>
      <StyledCreateRoleSection>
        <Button
          Icon={IconPlus}
          title={t`Create Role`}
          variant="secondary"
          size="small"
          disabled={!isPermissionsV2Enabled}
          onClick={() => navigateSettings(SettingsPath.RoleCreate)}
        />
      </StyledCreateRoleSection>
    </Section>
  );
};
