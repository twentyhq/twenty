import styled from '@emotion/styled';
import { Avatar, OverflowingTextWithTooltip } from 'twenty-ui';

import {
  WorkspaceMember,
  WorkspaceInvitation,
} from '@/workspace-member/types/WorkspaceMember';

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
  workspaceMember: WorkspaceMember | WorkspaceInvitation;
  accessory?: React.ReactNode;
};

const isWorkspaceInvitationGuard = (
  workspaceMember: WorkspaceMemberCardProps['workspaceMember'],
): workspaceMember is WorkspaceInvitation => 'expiresAt' in workspaceMember;

export const WorkspaceMemberCard = ({
  workspaceMember,
  accessory,
}: WorkspaceMemberCardProps) => {
  const isWorkspaceInvitation = isWorkspaceInvitationGuard(workspaceMember);

  return (
    <StyledContainer>
      <Avatar
        avatarUrl={isWorkspaceInvitation ? null : workspaceMember.avatarUrl}
        placeholderColorSeed={workspaceMember.id}
        placeholder={
          isWorkspaceInvitation
            ? workspaceMember.email[0]
            : (workspaceMember.name.firstName ?? '')
        }
        type="squared"
        size="xl"
      />
      <StyledContent>
        {!isWorkspaceInvitation && (
          <OverflowingTextWithTooltip
            text={
              workspaceMember.name.firstName +
              ' ' +
              workspaceMember.name.lastName
            }
          />
        )}
        <StyledEmailText>
          {isWorkspaceInvitation
            ? workspaceMember.email
            : workspaceMember.userEmail}
        </StyledEmailText>
      </StyledContent>
      {accessory}
    </StyledContainer>
  );
};
