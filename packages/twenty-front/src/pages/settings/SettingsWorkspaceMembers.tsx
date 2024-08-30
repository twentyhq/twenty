import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  H2Title,
  IconTrash,
  IconUsers,
  IconReload,
  IconMail,
  StyledText,
  Avatar,
} from 'twenty-ui';
import { isNonEmptyArray } from '@sniptt/guards';
import { useTheme } from '@emotion/react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceInviteLink } from '@/workspace/components/WorkspaceInviteLink';
import { WorkspaceInviteTeam } from '@/workspace/components/WorkspaceInviteTeam';
import { WorkspaceMemberCard } from '@/workspace/components/WorkspaceMemberCard';
import {
  useDeleteWorkspaceInvitationMutation,
  useGetWorkspaceInvitationsQuery,
} from '~/generated/graphql';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { workspaceInvitationsState } from '../../modules/workspace-invitation/states/workspaceInvitationsStates';
import { TableRow } from '../../modules/ui/layout/table/components/TableRow';
import { TableCell } from '../../modules/ui/layout/table/components/TableCell';
import { Status } from '../../modules/ui/display/status/components/Status';
import { formatDistanceToNow } from 'date-fns';

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

export const SettingsWorkspaceMembers = () => {
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [workspaceMemberToDelete, setWorkspaceMemberToDelete] = useState<
    string | undefined
  >();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { deleteOneRecord: deleteOneWorkspaceMember } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const [deleteWorkspaceInvitationMutation] =
    useDeleteWorkspaceInvitationMutation();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const handleRemoveWorkspaceMember = async (workspaceMemberId: string) => {
    await deleteOneWorkspaceMember?.(workspaceMemberId);
    setIsConfirmationModalOpen(false);
  };

  const workspaceInvitations = useRecoilValue(workspaceInvitationsState);
  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);

  useGetWorkspaceInvitationsQuery({
    onError: (error: Error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    onCompleted: (data) => {
      setWorkspaceInvitations(data?.findWorkspaceInvitations ?? []);
    },
  });

  const handleRemoveWorkspaceInvitation = (appTokenId: string) => {
    deleteWorkspaceInvitationMutation({
      variables: {
        appTokenId,
      },
      onError: () => {
        enqueueSnackBar('Error deleting invitation', {
          variant: SnackBarVariant.Error,
          duration: 2000,
        });
      },
      onCompleted: () => {
        setWorkspaceInvitations(
          workspaceInvitations.filter(
            (workspaceInvitation) => workspaceInvitation.id !== appTokenId,
          ),
        );
      },
    });
  };

  const handleResendWorkspaceInvitation = async (invitationId: string) => {
    console.log('>>>>>>>>>>>>>>', 'Resend invitation ', invitationId);
  };

  const getExpiresAtText = (expiresAt: string) => {
    const expiresAtDate = new Date(expiresAt);
    return expiresAtDate < new Date()
      ? 'Expired'
      : formatDistanceToNow(new Date(expiresAt));
  };

  return (
    <SubMenuTopBarContainer Icon={IconUsers} title="Members">
      <SettingsPageContainer>
        {currentWorkspace?.inviteHash && (
          <Section>
            <H2Title
              title="Invite by link"
              description="Share this link to invite users to join your workspace"
            />
            <WorkspaceInviteLink
              inviteLink={`${window.location.origin}/invite/${currentWorkspace?.inviteHash}`}
            />
          </Section>
        )}
        <Section>
          <H2Title
            title="Members"
            description="Manage the members of your space here"
          />
          <Table>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader align={'right'}></TableHeader>
            </TableRow>
            {workspaceMembers?.map((workspaceMember) => (
              <TableRow key={workspaceMember.id}>
                <TableCell>
                  <StyledText
                    PrefixComponent={
                      <Avatar
                        avatarUrl={workspaceMember.avatarUrl}
                        placeholderColorSeed={workspaceMember.id}
                        placeholder={workspaceMember.name.firstName ?? ''}
                        type="rounded"
                        size="sm"
                      />
                    }
                    text={
                      workspaceMember.name.firstName +
                      ' ' +
                      workspaceMember.name.lastName
                    }
                  />
                </TableCell>
                <TableCell>
                  <StyledText
                    text={workspaceMember.userEmail}
                    color={theme.font.color.secondary}
                  />
                </TableCell>
                <TableCell align={'right'}>
                  <StyledButtonContainer>
                    <IconButton
                      onClick={() => {
                        setIsConfirmationModalOpen(true);
                        setWorkspaceMemberToDelete(workspaceMember.id);
                      }}
                      variant="tertiary"
                      size="medium"
                      Icon={IconTrash}
                    />
                  </StyledButtonContainer>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {/*{workspaceMembers?.map((member) => (*/}
          {/*  <WorkspaceMemberCard*/}
          {/*    key={member.id}*/}
          {/*    workspaceMember={member as WorkspaceMember}*/}
          {/*    accessory={*/}
          {/*      currentWorkspaceMember?.id !== member.id && (*/}
          {/*        <StyledButtonContainer>*/}
          {/*          <IconButton*/}
          {/*            onClick={() => {*/}
          {/*              setIsConfirmationModalOpen(true);*/}
          {/*              setWorkspaceMemberToDelete(member.id);*/}
          {/*            }}*/}
          {/*            variant="tertiary"*/}
          {/*            size="medium"*/}
          {/*            Icon={IconTrash}*/}
          {/*          />*/}
          {/*        </StyledButtonContainer>*/}
          {/*      )*/}
          {/*    }*/}
          {/*  />*/}
          {/*))}*/}
        </Section>
        <Section>
          <H2Title
            title="Invite by email"
            description="Send an invite email to your team"
          />
          <WorkspaceInviteTeam />
          <Table>
            <TableRow>
              <TableHeader>Email</TableHeader>
              <TableHeader align={'right'}>Expires in</TableHeader>
            </TableRow>
            {isNonEmptyArray(workspaceInvitations) &&
              workspaceInvitations?.map((workspaceInvitation) => (
                <TableRow key={workspaceInvitation.id}>
                  <TableCell>
                    <StyledText
                      PrefixComponent={
                        <IconMail
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                        />
                      }
                      text={workspaceInvitation.email}
                    />
                  </TableCell>
                  <TableCell align={'right'}>
                    <Status
                      color={'gray'}
                      text={getExpiresAtText(workspaceInvitation.expiresAt)}
                    />

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
          </Table>
        </Section>
      </SettingsPageContainer>
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        setIsOpen={setIsConfirmationModalOpen}
        title="Account Deletion"
        subtitle={
          <>
            This action cannot be undone. This will permanently delete this user
            and remove them from all their assignements.
          </>
        }
        onConfirmClick={() =>
          workspaceMemberToDelete &&
          handleRemoveWorkspaceMember(workspaceMemberToDelete)
        }
        deleteButtonText="Delete account"
      />
    </SubMenuTopBarContainer>
  );
};
