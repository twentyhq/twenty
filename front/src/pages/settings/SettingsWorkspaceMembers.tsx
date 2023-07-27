import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@/ui/button/components/Button';
import { IconSettings, IconTrash } from '@/ui/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';
import { MainSectionTitle } from '@/ui/title/components/MainSectionTitle';
import { SubSectionTitle } from '@/ui/title/components/SubSectionTitle';
import { WorkspaceInviteLink } from '@/workspace/components/WorkspaceInviteLink';
import { WorkspaceMemberCard } from '@/workspace/components/WorkspaceMemberCard';
import {
  useGetWorkspaceMembersQuery,
  useRemoveWorkspaceMemberMutation,
} from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 350px;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

const ButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

export function SettingsWorkspaceMembers() {
  const [currentUser] = useRecoilState(currentUserState);
  const workspace = currentUser?.workspaceMember?.workspace;
  const theme = useTheme();

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

        const normalizedId = cache.identify({
          id: responseData.deleteWorkspaceMember.id,
          __typename: 'WorkspaceMember',
        });

        // Evict object from cache
        cache.evict({ id: normalizedId });

        // Clean up relation to this object
        cache.gc();
      },
    });
  };

  return (
    <SubMenuTopBarContainer icon={<IconSettings size={16} />} title="Settings">
      <StyledContainer>
        <MainSectionTitle>Members</MainSectionTitle>
        {workspace?.inviteHash && (
          <>
            <SubSectionTitle
              title="Invite"
              description="Send an invitation to use Twenty"
            />
            <WorkspaceInviteLink
              inviteLink={`${window.location.origin}/invite/${workspace?.inviteHash}`}
            />
          </>
        )}
        <SubSectionTitle
          title="Members"
          description="Manage the members of your space here"
        />
        {data?.workspaceMembers?.map((member) => (
          <WorkspaceMemberCard
            key={member.user.id}
            workspaceMember={{ user: member.user }}
            accessory={
              currentUser?.id !== member.user.id && (
                <ButtonContainer>
                  <Button
                    onClick={() => handleRemoveWorkspaceMember(member.user.id)}
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.Small}
                    icon={<IconTrash size={theme.icon.size.md} />}
                  />
                </ButtonContainer>
              )
            }
          />
        ))}
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
}
