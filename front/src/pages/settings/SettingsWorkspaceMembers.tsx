import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { MainSectionTitle } from '@/ui/components/section-titles/MainSectionTitle';
import { SubSectionTitle } from '@/ui/components/section-titles/SubSectionTitle';
import { NoTopBarContainer } from '@/ui/layout/containers/NoTopBarContainer';
import { WorkspaceMemberCard } from '@/workspace/components/WorkspaceMemberCard';
import { useGetCurrentWorkspaceQuery } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 350px;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(8)};
  }
`;

export function SettingsWorkspaceMembers() {
  const { data } = useGetCurrentWorkspaceQuery();

  return (
    <NoTopBarContainer>
      <StyledContainer>
        <MainSectionTitle>Members</MainSectionTitle>
        <SubSectionTitle
          title="Members"
          description="Manage the members of your space here"
        />
        {data?.currentWorkspace?.workspaceMember?.map((member) => (
          <WorkspaceMemberCard
            key={member.user.id}
            workspaceMember={{ user: member.user }}
          />
        ))}
      </StyledContainer>
    </NoTopBarContainer>
  );
}
