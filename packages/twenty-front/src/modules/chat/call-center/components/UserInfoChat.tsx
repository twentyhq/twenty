import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';

import { IMessage, WhatsappDocument } from '@/chat/types/WhatsappDocument';
import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui/display';

interface WhatsappProps {
  message: IMessage;
  selectedChat: WhatsappDocument;
  currentWorkspaceMember: CurrentWorkspaceMember | null;
}

const StyledUserName = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 600;
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

export const AvatarComponent: React.FC<WhatsappProps> = ({
  message,
  selectedChat,
  currentWorkspaceMember,
}) => {
  return (
    <Avatar
      avatarUrl={
        message.from !== 'system' ? '' : currentWorkspaceMember?.avatarUrl
      }
      placeholder={
        message.from !== 'system'
          ? selectedChat.client.name
          : currentWorkspaceMember?.name.firstName
      }
      placeholderColorSeed={
        message.from !== 'system'
          ? selectedChat.client.name
          : currentWorkspaceMember?.name.firstName
      }
      type={'rounded'}
      size="xl"
    />
  );
};

export const UsernameComponent: React.FC<WhatsappProps> = ({
  message,
  selectedChat,
  currentWorkspaceMember,
}) => {
  return (
    <StyledUserName
      style={{
        margin: 0,
      }}
    >
      {message.from !== 'system'
        ? selectedChat.client.name
        : `${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`}
    </StyledUserName>
  );
};
