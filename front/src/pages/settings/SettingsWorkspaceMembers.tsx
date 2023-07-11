import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Button } from '@/ui/components/buttons/Button';
import { TextInput } from '@/ui/components/inputs/TextInput';
import { MainSectionTitle } from '@/ui/components/section-titles/MainSectionTitle';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { IconLink, IconTrash } from '@/ui/icons';
import { NoTopBarContainer } from '@/ui/layout/containers/NoTopBarContainer';
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

const CopyLinkContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const LinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

export function SettingsWorkspaceMembers() {
  const [currentUser] = useRecoilState(currentUserState);
  const workspace = currentUser?.workspaceMember?.workspace;
  const [isCopied, setIsCopied] = useState(false);
  const theme = useTheme();
  const inviteLink = `${window.location.origin}/invite/${workspace?.inviteHash}`;

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
    <NoTopBarContainer>
      <StyledContainer>
        <MainSectionTitle>Members</MainSectionTitle>
        {workspace?.inviteHash && (
          <>
            <SubSectionTitle
              title="Invite"
              description="Send an invitation to use Twenty"
            />
            <CopyLinkContainer>
              <LinkContainer>
                <TextInput value={inviteLink} disabled fullWidth />
              </LinkContainer>
              <Button
                icon={<IconLink size={theme.icon.size.md} />}
                variant="primary"
                title={isCopied ? 'Copied' : 'Copy link'}
                disabled={isCopied}
                onClick={() => {
                  setIsCopied(true);
                  navigator.clipboard.writeText(inviteLink);
                }}
              />
            </CopyLinkContainer>
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
                    variant="tertiary"
                    size="small"
                    icon={<IconTrash size={theme.icon.size.md} />}
                  />
                </ButtonContainer>
              )
            }
          />
        ))}
      </StyledContainer>
    </NoTopBarContainer>
  );
}
