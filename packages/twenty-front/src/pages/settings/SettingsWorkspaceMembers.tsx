import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceInviteLink } from '@/workspace/components/WorkspaceInviteLink';
import { WorkspaceInviteTeam } from '@/workspace/components/WorkspaceInviteTeam';
import { ApolloError } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  Avatar,
  H2Title,
  IconMail,
  IconReload,
  IconSearch,
  IconTrash,
  Status,
  TooltipDelay,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useGetWorkspaceInvitationsQuery } from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { TableCell } from '../../modules/ui/layout/table/components/TableCell';
import { TableRow } from '../../modules/ui/layout/table/components/TableRow';
import { useDeleteWorkspaceInvitation } from '../../modules/workspace-invitation/hooks/useDeleteWorkspaceInvitation';
import { useResendWorkspaceInvitation } from '../../modules/workspace-invitation/hooks/useResendWorkspaceInvitation';
import { workspaceInvitationsState } from '../../modules/workspace-invitation/states/workspaceInvitationsStates';

export const WORKSPACE_MEMBER_DELETION_MODAL_ID =
  'workspace-member-deletion-modal';

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledTable = styled(Table)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledTextContainerWithEllipsis = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSearchContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  input {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledNoMembers = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsWorkspaceMembers = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const theme = useTheme();
  const [workspaceMemberToDelete, setWorkspaceMemberToDelete] = useState<
    string | undefined
  >();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { deleteOneRecord: deleteOneWorkspaceMember } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { resendInvitation } = useResendWorkspaceInvitation();
  const { deleteWorkspaceInvitation } = useDeleteWorkspaceInvitation();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const handleRemoveWorkspaceMember = async (workspaceMemberId: string) => {
    await deleteOneWorkspaceMember?.(workspaceMemberId);
  };

  const workspaceInvitations = useRecoilValue(workspaceInvitationsState);
  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);

  const [searchFilter, setSearchFilter] = useState('');

  const handleSearchChange = (text: string) => {
    setSearchFilter(text);
  };

  useGetWorkspaceInvitationsQuery({
    onError: (error: ApolloError) => {
      enqueueErrorSnackBar({
        apolloError: error,
      });
    },
    onCompleted: (data) => {
      setWorkspaceInvitations(data?.findWorkspaceInvitations ?? []);
    },
  });

  const handleRemoveWorkspaceInvitation = async (appTokenId: string) => {
    const result = await deleteWorkspaceInvitation({ appTokenId });
    if (isDefined(result.errors)) {
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
    if (isDefined(result.errors)) {
      enqueueErrorSnackBar({
        message: t`Error resending invitation`,
        options: {
          duration: 2000,
        },
      });
    }
  };

  const getExpiresAtText = (expiresAt: string) => {
    const expiresAtDate = new Date(expiresAt);
    return expiresAtDate < new Date()
      ? t`Expired`
      : formatDistanceToNow(new Date(expiresAt));
  };

  const filteredWorkspaceMembers = !searchFilter
    ? workspaceMembers
    : workspaceMembers.filter((member) => {
        const searchTerm = searchFilter.toLowerCase();
        const firstName = member.name.firstName?.toLowerCase() || '';
        const lastName = member.name.lastName?.toLowerCase() || '';
        const email = member.userEmail?.toLowerCase() || '';

        return (
          firstName.includes(searchTerm) ||
          lastName.includes(searchTerm) ||
          email.includes(searchTerm)
        );
      });

  const { openModal } = useModal();

  return (
    <SubMenuTopBarContainer
      title={t`Members`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Members</Trans> },
      ]}
    >
      <SettingsPageContainer>
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
            title={t`Manage Members`}
            description={t`Manage the members of your workspace here`}
          />
          <StyledSearchContainer>
            <StyledSearchInput
              instanceId="workspace-members-search"
              value={searchFilter}
              onChange={handleSearchChange}
              placeholder={t`Search a team member...`}
              fullWidth
              LeftIcon={IconSearch}
              sizeVariant="lg"
            />
          </StyledSearchContainer>
          <StyledTable>
            <TableRow
              gridAutoColumns="150px 1fr 1fr"
              mobileGridAutoColumns="100px 1fr 1fr"
            >
              <TableHeader>
                <Trans>Name</Trans>
              </TableHeader>
              <TableHeader>
                <Trans>Email</Trans>
              </TableHeader>
              <TableHeader align={'right'}></TableHeader>
            </TableRow>
            <StyledTableRows>
              {filteredWorkspaceMembers.length > 0 ? (
                filteredWorkspaceMembers.map((workspaceMember) => (
                  <TableRow
                    gridAutoColumns="150px 1fr 1fr"
                    mobileGridAutoColumns="100px 1fr 1fr"
                    key={workspaceMember.id}
                  >
                    <TableCell>
                      <StyledIconWrapper>
                        <Avatar
                          avatarUrl={workspaceMember.avatarUrl}
                          placeholderColorSeed={workspaceMember.id}
                          placeholder={workspaceMember.name.firstName ?? ''}
                          type="rounded"
                          size="sm"
                        />
                      </StyledIconWrapper>
                      <StyledTextContainerWithEllipsis
                        id={`hover-text-${workspaceMember.id}`}
                      >
                        {workspaceMember.name.firstName +
                          ' ' +
                          workspaceMember.name.lastName}
                      </StyledTextContainerWithEllipsis>
                      <AppTooltip
                        anchorSelect={`#hover-text-${workspaceMember.id}`}
                        content={`${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`}
                        noArrow
                        place="top"
                        positionStrategy="fixed"
                        delay={TooltipDelay.shortDelay}
                      />
                    </TableCell>
                    <TableCell>
                      <StyledTextContainerWithEllipsis>
                        {workspaceMember.userEmail}
                      </StyledTextContainerWithEllipsis>
                    </TableCell>
                    <TableCell align={'right'}>
                      {currentWorkspaceMember?.id !== workspaceMember.id && (
                        <StyledButtonContainer>
                          <IconButton
                            onClick={() => {
                              openModal(WORKSPACE_MEMBER_DELETION_MODAL_ID);
                              setWorkspaceMemberToDelete(workspaceMember.id);
                            }}
                            variant="tertiary"
                            size="medium"
                            Icon={IconTrash}
                          />
                        </StyledButtonContainer>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <StyledNoMembers>
                  {!searchFilter
                    ? t`No members`
                    : t`No members match your search`}
                </StyledNoMembers>
              )}
            </StyledTableRows>
          </StyledTable>
        </Section>
        <Section>
          <H2Title
            title={t`Invite by email`}
            description={t`Send an invite email to your team`}
          />
          <WorkspaceInviteTeam />
          {isNonEmptyArray(workspaceInvitations) && (
            <StyledTable>
              <TableRow
                gridAutoColumns="250px 1fr 1fr"
                mobileGridAutoColumns="100px 1fr 1fr"
              >
                <TableHeader>
                  <Trans>Email</Trans>
                </TableHeader>
                <TableHeader align={'center'}>
                  <Trans>Expires in</Trans>
                </TableHeader>
                <TableHeader></TableHeader>
              </TableRow>
              <StyledTableRows>
                {workspaceInvitations?.map((workspaceInvitation) => (
                  <TableRow
                    gridAutoColumns="250px 1fr 1fr"
                    mobileGridAutoColumns="100px 1fr 1fr"
                    key={workspaceInvitation.id}
                  >
                    <TableCell>
                      <StyledIconWrapper>
                        <IconMail
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                        />
                      </StyledIconWrapper>
                      <StyledTextContainerWithEllipsis>
                        {workspaceInvitation.email}
                      </StyledTextContainerWithEllipsis>
                    </TableCell>
                    <TableCell align={'center'}>
                      <Status
                        color={'gray'}
                        text={getExpiresAtText(workspaceInvitation.expiresAt)}
                      />
                    </TableCell>
                    <TableCell align={'right'}>
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
            </StyledTable>
          )}
        </Section>
      </SettingsPageContainer>
      <ConfirmationModal
        modalId={WORKSPACE_MEMBER_DELETION_MODAL_ID}
        title={t`Account Deletion`}
        subtitle={
          <Trans>
            This action cannot be undone. This will permanently delete this user
            and remove them from all their assignments.
          </Trans>
        }
        onConfirmClick={() =>
          workspaceMemberToDelete &&
          handleRemoveWorkspaceMember(workspaceMemberToDelete)
        }
        confirmButtonText={t`Delete account`}
      />
    </SubMenuTopBarContainer>
  );
};
