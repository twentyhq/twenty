import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { SettingsApprovedAccessDomainsListCard } from '@/settings/security/components/approvedAccessDomains/SettingsApprovedAccessDomainsListCard';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useDeleteWorkspaceInvitation } from '@/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { useResendWorkspaceInvitation } from '@/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { WorkspaceInviteLink } from '@/workspace/components/WorkspaceInviteLink';
import { WorkspaceInviteTeam } from '@/workspace/components/WorkspaceInviteTeam';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { formatDistanceToNow } from 'date-fns';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconButton, Section, useToast } from 'twenty-ui/components';
import { IconMail, IconReload, IconTrash } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { GetWorkspaceInvitationsDocument } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  margin-left: ${themeCssVariables.spacing[2]};
`;

const StyledExpiresInHeader = styled.span`
  white-space: nowrap;
`;

const StyledTableContainer = styled.div`
  > div {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledIconWrapper = styled.div`
  align-items: center;
  display: flex;
  margin-right: ${themeCssVariables.spacing[2]};
`;

const StyledTextContainerWithEllipsis = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceMembersInviteTab = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const roles = useSettingsAllRoles();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const rolesById = useMemo(
    () => new Map(roles.map((role) => [role.id, role])),
    [roles],
  );

  const { resendInvitation } = useResendWorkspaceInvitation();
  const { deleteWorkspaceInvitation } = useDeleteWorkspaceInvitation();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { data: invitationsData, error: invitationsError } = useQuery(
    GetWorkspaceInvitationsDocument,
  );

  const workspaceInvitations = invitationsData?.findWorkspaceInvitations ?? [];

  const handleRemoveWorkspaceInvitation = async (appTokenId: string) => {
    const result = await deleteWorkspaceInvitation({ appTokenId });
    if (isDefined(result.error)) {
      enqueueToast({
        variant: 'error',
        children: t`Error deleting invitation`,
        duration: 2000,
      });
    }
  };

  const handleResendWorkspaceInvitation = async (appTokenId: string) => {
    const result = await resendInvitation({ appTokenId });
    if (isDefined(result.error)) {
      enqueueToast({
        variant: 'error',
        children: t`Error resending invitation`,
        duration: 2000,
      });
    }
  };

  const getExpiresAtText = (expiresAt: string) => {
    const expirationDate = new Date(expiresAt);
    if (expirationDate.getTime() <= Date.now()) return t`Expired`;
    return formatDistanceToNow(expirationDate, { locale: localeCatalog });
  };

  return (
    <>
      <ToastOnQueryErrorEffect error={invitationsError} />

      <SettingsRolesQueryEffect />
      {currentWorkspace?.inviteHash &&
        currentWorkspace?.isPublicInviteLinkEnabled && (
          <Section.Root>
            <Section.Header
              title={t`Invite by link`}
              description={t`Share this link to invite users to join your workspace`}
            />
            <WorkspaceInviteLink
              inviteLink={`${window.location.origin}/invite/${currentWorkspace?.inviteHash}`}
            />
          </Section.Root>
        )}
      <Section.Root>
        <Section.Header
          title={t`Invite by email`}
          description={t`Send an invite email to your team`}
        />
        <WorkspaceInviteTeam roles={roles} />
        {isNonEmptyArray(workspaceInvitations) && (
          <StyledTableContainer>
            <Table>
              <TableRow
                gridAutoColumns="2fr 1fr 1fr 80px"
                mobileGridAutoColumns="2fr 1fr 1fr 72px"
              >
                <TableHeader>
                  <Trans>Email</Trans>
                </TableHeader>
                <TableHeader>
                  <Trans>Role</Trans>
                </TableHeader>
                <TableHeader align="center">
                  <StyledExpiresInHeader>
                    <Trans>Expires in</Trans>
                  </StyledExpiresInHeader>
                </TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
              <StyledTableRows>
                {workspaceInvitations.map((workspaceInvitation) => (
                  <TableRow
                    gridAutoColumns="2fr 1fr 1fr 80px"
                    mobileGridAutoColumns="2fr 1fr 1fr 72px"
                    key={workspaceInvitation.id}
                  >
                    <TableCell
                      color={themeCssVariables.font.color.primary}
                      minWidth="0"
                      overflow="hidden"
                    >
                      <StyledIconWrapper>
                        <IconMail
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                        />
                      </StyledIconWrapper>
                      <Tooltip
                        content={workspaceInvitation.email}
                        side="top"
                        positionMethod="fixed"
                        delay={TooltipDelay.shortDelay}
                      >
                        <StyledTextContainerWithEllipsis
                          id={`invitation-email-${workspaceInvitation.id}`}
                        >
                          {workspaceInvitation.email}
                        </StyledTextContainerWithEllipsis>
                      </Tooltip>
                    </TableCell>
                    <TableCell minWidth="0" overflow="hidden">
                      <StyledTextContainerWithEllipsis>
                        {rolesById.get(workspaceInvitation.roleId ?? '')
                          ?.label ?? t`Default role`}
                      </StyledTextContainerWithEllipsis>
                    </TableCell>
                    <TableCell align="center">
                      <Status color="gray">
                        {getExpiresAtText(workspaceInvitation.expiresAt)}
                      </Status>
                    </TableCell>
                    <TableCell align="right">
                      <StyledButtonContainer>
                        <IconButton
                          aria-label={t`Resend invitation`}
                          onClick={() => {
                            handleResendWorkspaceInvitation(
                              workspaceInvitation.id,
                            );
                          }}
                          variant="ghost"
                          size="md"
                        >
                          <IconReload />
                        </IconButton>
                        <IconButton
                          aria-label={t`Remove invitation`}
                          onClick={() => {
                            handleRemoveWorkspaceInvitation(
                              workspaceInvitation.id,
                            );
                          }}
                          variant="ghost"
                          size="md"
                        >
                          <IconTrash />
                        </IconButton>
                      </StyledButtonContainer>
                    </TableCell>
                  </TableRow>
                ))}
              </StyledTableRows>
            </Table>
          </StyledTableContainer>
        )}
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Approved Domains`}
          description={t`Anyone with an email address at these domains is allowed to sign up for this workspace.`}
        />
        <SettingsApprovedAccessDomainsListCard />
      </Section.Root>
    </>
  );
};
