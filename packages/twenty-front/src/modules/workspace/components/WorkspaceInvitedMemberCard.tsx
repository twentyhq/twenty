import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui';

import { InvitedMember } from '@/settings/roles/types/InvitedMember';
import { MemberInvitePill } from '@/workspace-member/components/MemberInvitePill';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing(3)};
  overflow: auto;
`;

const StyledEmailText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type WorkspaceInvitedMemberCardProps = {
  invitedMember: InvitedMember;
};

export const WorkspaceInvitedMemberCard = ({
  invitedMember,
}: WorkspaceInvitedMemberCardProps) => (
  <StyledContainer>
    <Avatar
      placeholderColorSeed={invitedMember.id}
      placeholder={''}
      type="rounded"
      size="lg"
    />
    <StyledContent>
      <StyledEmailText>{invitedMember.email}</StyledEmailText>
    </StyledContent>
    <MemberInvitePill />
  </StyledContainer>
);
