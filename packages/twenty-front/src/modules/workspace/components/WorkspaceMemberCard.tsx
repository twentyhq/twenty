import styled from '@emotion/styled';

import { OverflowingTextWithTooltip } from '@/ui/display/tooltip/OverflowingTextWithTooltip';
import { Avatar } from '@/users/components/Avatar';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)};
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

type WorkspaceMemberCardProps = {
  workspaceMember: WorkspaceMember;
  accessory?: React.ReactNode;
};

export const WorkspaceMemberCard = ({
  workspaceMember,
  accessory,
}: WorkspaceMemberCardProps) => (
  <StyledContainer>
    <Avatar
      avatarUrl={workspaceMember.avatarUrl}
      entityId={workspaceMember.id}
      placeholder={workspaceMember.name.firstName || ''}
      type="squared"
      size="xl"
    />
    <StyledContent>
      <OverflowingTextWithTooltip
        text={
          workspaceMember.name.firstName + ' ' + workspaceMember.name.lastName
        }
      />
      <StyledEmailText>{workspaceMember.userEmail}</StyledEmailText>
    </StyledContent>

    {accessory}
  </StyledContainer>
);
