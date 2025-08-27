import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { SettingsRolesTableHeader } from '@/settings/roles/components/SettingsRolesTableHeader';
import { SettingsRolesTableRow } from '@/settings/roles/components/SettingsRolesTableRow';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { SettingsPath } from '@/types/SettingsPath';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useRecoilValue } from 'recoil';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { sortByAscString } from '~/utils/array/sortByAscString';

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

  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);

  const sortedSettingsAllRoles = [...settingsAllRoles].sort((a, b) =>
    sortByAscString(a.label, b.label),
  );

  return (
    <Section>
      <H2Title
        title={t`All roles`}
        description={t`Assign roles to manage each member’s access and permissions`}
      />
      <Table>
        <SettingsRolesTableHeader />
        <StyledTableRows>
          {sortedSettingsAllRoles.length === 0 ? (
            <StyledNoRoles>{t`No roles found`}</StyledNoRoles>
          ) : (
            sortedSettingsAllRoles.map((role) => (
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
          onClick={() => navigateSettings(SettingsPath.RoleCreate)}
        />
      </StyledCreateRoleSection>
    </Section>
  );
};
