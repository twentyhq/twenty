import styled from '@emotion/styled';

import { Avatar } from '@/users/components/Avatar';
import { getImageAbsoluteURI } from '@/users/utils/getProfilePictureAbsoluteURI';
import { User } from '~/generated/graphql';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const AvatarContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(3)};
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const NameAndEmailContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const NameText = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const EmailText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type OwnProps = {
  workspaceMember: {
    user: Pick<User, 'firstName' | 'lastName' | 'avatarUrl' | 'email'>;
  };
};

export function WorkspaceMemberCard({ workspaceMember }: OwnProps) {
  return (
    <StyledContainer>
      <AvatarContainer>
        <Avatar
          avatarUrl={getImageAbsoluteURI(workspaceMember.user.avatarUrl)}
          placeholder={workspaceMember.user.firstName || ''}
          type="squared"
          size={40}
        />
      </AvatarContainer>
      <TextContainer>
        <NameAndEmailContainer>
          <NameText>
            {workspaceMember.user.firstName} {workspaceMember.user.lastName}{' '}
          </NameText>
          <EmailText>{workspaceMember.user.email}</EmailText>
        </NameAndEmailContainer>
      </TextContainer>
    </StyledContainer>
  );
}
