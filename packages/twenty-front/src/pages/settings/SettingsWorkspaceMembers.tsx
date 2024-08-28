import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { H2Title, IconTrash, IconUsers, IconReload } from 'twenty-ui';

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
import {
  WorkspaceInvitation,
  WorkspaceMember,
} from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceInviteLink } from '@/workspace/components/WorkspaceInviteLink';
import { WorkspaceInviteTeam } from '@/workspace/components/WorkspaceInviteTeam';
import { WorkspaceMemberCard } from '@/workspace/components/WorkspaceMemberCard';
import {
  useDeleteWorkspaceInvitationMutation,
  useGetWorkspaceInvitationsQuery,
} from '~/generated/graphql';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { workspaceInvitationsState } from '../../modules/workspace-invitation/states/workspaceInvitationsStates';

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

export const SettingsWorkspaceMembers = () => {
  const { enqueueSnackBar } = useSnackBar();
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

  // const handleResendWorkspaceInvitation = async (invitationId: string) => {
  //   console.log('>>>>>>>>>>>>>>', 'Resend invitation ', invitationId);
  // };

  return (
    <SubMenuTopBarContainer Icon={IconUsers} title="Members">
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="Invite by email"
            description="Send an invite email to your team"
          />
          <WorkspaceInviteTeam />
        </Section>
        {currentWorkspace?.inviteHash && (
          <Section>
            <H2Title
              title="Or send an invite link"
              description="Copy and send an invite link directly"
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
          {workspaceMembers?.map((member) => (
            <WorkspaceMemberCard
              key={member.id}
              workspaceMember={member as WorkspaceMember}
              accessory={
                currentWorkspaceMember?.id !== member.id && (
                  <StyledButtonContainer>
                    <IconButton
                      onClick={() => {
                        setIsConfirmationModalOpen(true);
                        setWorkspaceMemberToDelete(member.id);
                      }}
                      variant="tertiary"
                      size="medium"
                      Icon={IconTrash}
                    />
                  </StyledButtonContainer>
                )
              }
            />
          ))}
        </Section>
        {workspaceInvitations.length > 0 && (
          <Section>
            <H2Title
              title="Invitations"
              description="Manage users who haven't accepted your invite"
            />
            {workspaceInvitations?.map((workspaceInvitation) => (
              <WorkspaceMemberCard
                key={workspaceInvitation.id}
                workspaceMember={workspaceInvitation as WorkspaceInvitation}
                accessory={
                  <StyledButtonContainer>
                    {/*<IconButton*/}
                    {/*  onClick={() => {*/}
                    {/*    handleRemoveWorkspaceInvitation(workspaceInvitation.id);*/}
                    {/*  }}*/}
                    {/*  variant="tertiary"*/}
                    {/*  size="medium"*/}
                    {/*  Icon={IconReload}*/}
                    {/*/>*/}
                    <IconButton
                      onClick={() => {
                        handleRemoveWorkspaceInvitation(workspaceInvitation.id);
                      }}
                      variant="tertiary"
                      size="medium"
                      Icon={IconTrash}
                    />
                  </StyledButtonContainer>
                }
              />
            ))}
          </Section>
        )}
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
