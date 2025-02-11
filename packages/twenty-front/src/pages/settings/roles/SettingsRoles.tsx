import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  AppTooltip,
  Avatar,
  Button,
  H2Title,
  IconChevronRight,
  IconLock,
  IconPlus,
  IconUser,
  Section,
  TooltipDelay,
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
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    cursor: pointer;
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
    margin-left: -5px;

    &:first-of-type {
      margin-left: 0;
    }
  }
`;

const StyledTableHeaderRow = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledBottomSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: flex-end;
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledAvatarContainer = styled.div`
  border: 0px;
`;

const StyledAssignedText = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

export const SettingsRoles = () => {
  const { t } = useLingui();
  const isPermissionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );
  const theme = useTheme();
  const navigateSettings = useNavigateSettings();
  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery({
    fetchPolicy: 'network-only',
  });

  if (!isPermissionsEnabled) {
    return null;
  }

  const handleRoleClick = (roleId: string) => {
    navigateSettings(SettingsPath.RoleDetail, { roleId });
  };

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
            <StyledTableHeaderRow>
              <TableRow>
                <TableHeader>
                  <Trans>Name</Trans>
                </TableHeader>
                <TableHeader align={'right'}>
                  <Trans>Assigned to</Trans>
                </TableHeader>
                <TableHeader align={'right'}></TableHeader>
              </TableRow>
            </StyledTableHeaderRow>
            {!rolesLoading &&
              rolesData?.getRoles.map((role) => (
                <StyledTableRow
                  key={role.id}
                  onClick={() => handleRoleClick(role.id)}
                >
                  <TableCell>
                    <StyledNameCell>
                      <IconUser size={theme.icon.size.md} />
                      {role.label}
                      {!role.isEditable && (
                        <IconLock size={theme.icon.size.sm} />
                      )}
                    </StyledNameCell>
                  </TableCell>
                  <TableCell align={'right'}>
                    <StyledAssignedCell>
                      <StyledAvatarGroup>
                        {role.workspaceMembers
                          .slice(0, 5)
                          .map((workspaceMember) => (
                            <>
                              <StyledAvatarContainer
                                key={workspaceMember.id}
                                id={`avatar-${workspaceMember.id}`}
                              >
                                <Avatar
                                  avatarUrl={workspaceMember.avatarUrl}
                                  placeholderColorSeed={workspaceMember.id}
                                  placeholder={
                                    workspaceMember.name.firstName ?? ''
                                  }
                                  type="rounded"
                                  size="md"
                                />
                              </StyledAvatarContainer>
                              <AppTooltip
                                anchorSelect={`#avatar-${workspaceMember.id}`}
                                content={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
                                noArrow
                                place="top"
                                positionStrategy="fixed"
                                delay={TooltipDelay.shortDelay}
                              />
                            </>
                          ))}
                      </StyledAvatarGroup>
                      <StyledAssignedText>
                        {role.workspaceMembers.length}
                      </StyledAssignedText>
                    </StyledAssignedCell>
                  </TableCell>
                  <TableCell align={'right'}>
                    <StyledIconChevronRight size={theme.icon.size.md} />
                  </TableCell>
                </StyledTableRow>
              ))}
          </StyledTable>
          <StyledBottomSection>
            <Button
              Icon={IconPlus}
              title={t`Create Role`}
              variant="secondary"
              size="small"
              soon
            />
          </StyledBottomSection>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
