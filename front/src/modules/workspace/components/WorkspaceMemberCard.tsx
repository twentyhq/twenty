import styled from '@emotion/styled';

import { Avatar } from '@/users/components/Avatar';
import { User } from '~/generated/graphql';

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
`;

const StyledNameText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledEmailText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type WorkspaceMemberCardProps = {
  workspaceMember: {
    user: Pick<
      User,
      'id' | 'firstName' | 'lastName' | 'displayName' | 'avatarUrl' | 'email'
    >;
  };
  accessory?: React.ReactNode;
};

export const WorkspaceMemberCard = ({
  workspaceMember,
  accessory,
}: WorkspaceMemberCardProps) => (
  <StyledContainer>
    <Avatar
      avatarUrl={workspaceMember.user.avatarUrl}
      colorId={workspaceMember.user.id}
      placeholder={workspaceMember.user.firstName || ''}
      type="squared"
      size="xl"
    />
    <StyledContent>
      <StyledNameText>{workspaceMember.user.displayName}</StyledNameText>
      <StyledEmailText>{workspaceMember.user.email}</StyledEmailText>
    </StyledContent>

    {accessory}
  </StyledContainer>
);
