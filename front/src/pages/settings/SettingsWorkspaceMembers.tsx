import { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings, IconTrash } from '@/ui/display/icon';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { WorkspaceInviteLink } from '@/workspace/components/WorkspaceInviteLink';
import { WorkspaceMemberCard } from '@/workspace/components/WorkspaceMemberCard';
import {
  useGetWorkspaceMembersQuery,
  useRemoveWorkspaceMemberMutation,
} from '~/generated/graphql';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

export const SettingsWorkspaceMembers = () => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | undefined>();

  const [currentUser] = useRecoilState(currentUserState);
  const workspace = currentUser?.workspaceMember?.workspace;

  const { data } = useGetWorkspaceMembersQuery();

  const [removeWorkspaceMember] = useRemoveWorkspaceMemberMutation();

  const handleRemoveWorkspaceMember = async (userId: string) => {
    await removeWorkspaceMember({
      variables: {
        where: {
          userId,
        },
      },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteWorkspaceMember: {
          __typename: 'WorkspaceMember',
          id: userId,
        },
      },
      update: (cache, { data: responseData }) => {
        if (!responseData) {
          return;
        }

        cache.evict({
          id: cache.identify({
            id: responseData.deleteWorkspaceMember.id,
            __typename: 'WorkspaceMember',
          }),
        });

        cache.evict({
          id: cache.identify({
            id: userId,
            __typename: 'User',
          }),
        });

        cache.gc();
      },
    });
    setIsConfirmationModalOpen(false);
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer width={350}>
        <StyledH1Title title="Members" />
        {workspace?.inviteHash && (
          <Section>
            <H2Title
              title="Invite"
              description="Send an invitation to use Twenty"
            />
            <WorkspaceInviteLink
              inviteLink={`${window.location.origin}/invite/${workspace?.inviteHash}`}
            />
          </Section>
        )}
        <Section>
          <H2Title
            title="Members"
            description="Manage the members of your space here"
          />
          {data?.workspaceMembers?.map((member) => (
            <WorkspaceMemberCard
              key={member.user.id}
              workspaceMember={{ user: member.user }}
              accessory={
                currentUser?.id !== member.user.id && (
                  <StyledButtonContainer>
                    <IconButton
                      onClick={() => {
                        setIsConfirmationModalOpen(true);
                        setUserToDelete(member.user.id);
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
          userToDelete && handleRemoveWorkspaceMember(userToDelete)
        }
        deleteButtonText="Delete account"
      />
    </SubMenuTopBarContainer>
  );
};
