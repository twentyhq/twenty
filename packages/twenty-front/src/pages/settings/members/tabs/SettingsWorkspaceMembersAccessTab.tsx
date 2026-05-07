import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useContext, useEffect, useMemo } from 'react';

import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { SettingsApprovedAccessDomainsListCard } from '@/settings/security/components/approvedAccessDomains/SettingsApprovedAccessDomainsListCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { WorkspaceInviteLink } from '@/workspace/components/WorkspaceInviteLink';
import { WorkspaceInviteTeam } from '@/workspace/components/WorkspaceInviteTeam';
import { useDeleteWorkspaceInvitation } from '@/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { useResendWorkspaceInvitation } from '@/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  H2Title,
  IconMail,
  IconReload,
  IconTrash,
  Status,
  TooltipDelay,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { GetWorkspaceInvitationsDocument } from '~/generated-metadata/graphql';

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

export const SettingsWorkspaceMembersAccessTab = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const roles = useSettingsAllRoles();

  const rolesById = useMemo(
    () => new Map(roles.map((role) => [role.id, role])),
    [roles],
  );

  const { resendInvitation } = useResendWorkspaceInvitation();
  const { deleteWorkspaceInvitation } = useDeleteWorkspaceInvitation();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const workspaceInvitations = useAtomStateValue(workspaceInvitationsState);
  const setWorkspaceInvitations = useSetAtomState(workspaceInvitationsState);

  const { data: invitationsData, error: invitationsError } = useQuery(
    GetWorkspaceInvitationsDocument,
  );

  useSnackBarOnQueryError(invitationsError);

  useEffect(() => {
    if (invitationsData) {
      setWorkspaceInvitations(invitationsData?.findWorkspaceInvitations ?? []);
    }
  }, [invitationsData, setWorkspaceInvitations]);

  const handleRemoveWorkspaceInvitation = async (appTokenId: string) => {
    const result = await deleteWorkspaceInvitation({ appTokenId });
    if (isDefined(result.error)) {
      enqueueErrorSnackBar({
        message: t`Error deleting invitation`,
        options: {
          duration: 2000,
        },
      });
    }
  };

  const handleResendWorkspaceInvitation = async (appTokenId: string) => {
    const result = await resendInvitation({ appTokenId });
    if (isDefined(result.error)) {
      enqueueErrorSnackBar({
        message: t`Error resending invitation`,
        options: {
          duration: 2000,
        },
      });
    }
  };

  const getExpiresAtText = (expiresAt: string) => {
    const msLeft = new Date(expiresAt).getTime() - Date.now();

    if (msLeft <= 0) return t`Expired`;

    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    if (daysLeft === 1) return t`1 day`;

    return t`${daysLeft} days`;
  };

  return (
    <>
      {currentWorkspace?.inviteHash &&
        currentWorkspace?.isPublicInviteLinkEnabled && (
          <Section>
            <H2Title
              title={t`Invite by link`}
              description={t`Share this link to invite users to join your workspace`}
            />
            <WorkspaceInviteLink
              inviteLink={`${window.location.origin}/invite/${currentWorkspace?.inviteHash}`}
            />
          </Section>
        )}
      <Section>
        <H2Title
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
                {workspaceInvitations?.map((workspaceInvitation) => (
                  <TableRow
                    gridAutoColumns="2fr 1fr 1fr 80px"
                    mobileGridAutoColumns="2fr 1fr 1fr 72px"
                    key={workspaceInvitation.id}
                  >
                    <TableCell minWidth="0" overflow="hidden">
                      <StyledIconWrapper>
                        <IconMail
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                        />
                      </StyledIconWrapper>
                      <StyledTextContainerWithEllipsis
                        id={`invitation-email-${workspaceInvitation.id}`}
                      >
                        {workspaceInvitation.email}
                      </StyledTextContainerWithEllipsis>
                      <AppTooltip
                        anchorSelect={`#invitation-email-${workspaceInvitation.id}`}
                        content={workspaceInvitation.email}
                        noArrow
                        place="top"
                        positionStrategy="fixed"
                        delay={TooltipDelay.shortDelay}
                      />
                    </TableCell>
                    <TableCell minWidth="0" overflow="hidden">
                      <StyledTextContainerWithEllipsis>
                        {rolesById.get(workspaceInvitation.roleId ?? '')
                          ?.label ?? t`Default role`}
                      </StyledTextContainerWithEllipsis>
                    </TableCell>
                    <TableCell align="center">
                      <Status
                        color="gray"
                        text={getExpiresAtText(workspaceInvitation.expiresAt)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <StyledButtonContainer>
                        <IconButton
                          onClick={() => {
                            handleResendWorkspaceInvitation(
                              workspaceInvitation.id,
                            );
                          }}
                          variant="tertiary"
                          size="medium"
                          Icon={IconReload}
                        />
                        <IconButton
                          onClick={() => {
                            handleRemoveWorkspaceInvitation(
                              workspaceInvitation.id,
                            );
                          }}
                          variant="tertiary"
                          size="medium"
                          Icon={IconTrash}
                        />
                      </StyledButtonContainer>
                    </TableCell>
                  </TableRow>
                ))}
              </StyledTableRows>
            </Table>
          </StyledTableContainer>
        )}
      </Section>
      <Section>
        <H2Title
          title={t`Approved Domains`}
          description={t`Anyone with an email address at these domains is allowed to sign up for this workspace.`}
        />
        <SettingsApprovedAccessDomainsListCard />
      </Section>
    </>
  );
};
