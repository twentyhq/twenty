import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  Avatar,
  H2Title,
  IconChevronRight,
  IconLock,
  IconUser,
  Section,
} from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import { FeatureFlagKey, useGetRolesQuery } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledTable = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledTableRow = styled(TableRow)`
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledNameCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledAssignedCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAvatarGroup = styled.div`
  align-items: center;
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(1)};

  > * {
    border: 2px solid ${({ theme }) => theme.background.primary};
    margin-left: -8px;

    &:first-of-type {
      margin-left: 0;
    }
  }
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsRoles = () => {
  const { t } = useLingui();
  const isPermissionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );
  const theme = useTheme();

  const { data: rolesData, loading: isRolesLoading } = useGetRolesQuery();

  if (!isPermissionsEnabled) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={t`Roles`}
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

          <StyledTable>
            <TableRow>
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader>{t`Assigned to`}</TableHeader>
              <TableHeader />
            </TableRow>
            {!isRolesLoading &&
              rolesData?.getRoles.map((role) => (
                <StyledTableRow key={role.id}>
                  <TableCell>
                    <StyledNameCell>
                      <IconUser size={theme.icon.size.md} />
                      {role.label}
                      {!role.isEditable && (
                        <IconLock size={theme.icon.size.sm} />
                      )}
                    </StyledNameCell>
                  </TableCell>
                  <TableCell>
                    <StyledAssignedCell>
                      <StyledAvatarGroup>
                        {role.workspaceMembers
                          .slice(0, 5)
                          .map((workspaceMember) => (
                            <Avatar
                              key={workspaceMember.id}
                              avatarUrl={workspaceMember.avatarUrl}
                              placeholderColorSeed={workspaceMember.id}
                              placeholder={workspaceMember.name.firstName ?? ''}
                              type="rounded"
                              size="sm"
                            />
                          ))}
                      </StyledAvatarGroup>
                      {role.workspaceMembers.length}
                    </StyledAssignedCell>
                  </TableCell>
                  <TableCell>
                    <StyledIconChevronRight size={theme.icon.size.md} />
                  </TableCell>
                </StyledTableRow>
              ))}
          </StyledTable>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
