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

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const NameText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const EmailText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type OwnProps = {
  workspaceMember: {
    user: Pick<
      User,
      'id' | 'firstName' | 'lastName' | 'displayName' | 'avatarUrl' | 'email'
    >;
  };
  accessory?: React.ReactNode;
};

export function WorkspaceMemberCard({ workspaceMember, accessory }: OwnProps) {
  return (
    <StyledContainer>
      <Avatar
        avatarUrl={workspaceMember.user.avatarUrl}
        colorId={workspaceMember.user.id}
        placeholder={workspaceMember.user.firstName || ''}
        type="squared"
        size={40}
      />
      <Content>
        <NameText>{workspaceMember.user.displayName}</NameText>
        <EmailText>{workspaceMember.user.email}</EmailText>
      </Content>

      {accessory}
    </StyledContainer>
  );
}
