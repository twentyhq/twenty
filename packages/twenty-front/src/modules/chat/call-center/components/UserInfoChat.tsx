import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';

import { IMessage, WhatsappDocument } from '@/chat/types/WhatsappDocument';
import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui/display';

interface WhatsappProps {
  message: IMessage;
  selectedChat?: WhatsappDocument;
  currentWorkspaceMember?: CurrentWorkspaceMember | null;
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
        message.from ===
        `${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`
          ? currentWorkspaceMember?.avatarUrl
          : message.from
      }
      placeholder={message.from}
      placeholderColorSeed={message.from}
      type={'rounded'}
      size="xl"
    />
  );
};

export const UsernameComponent: React.FC<WhatsappProps> = ({ message }) => {
  return (
    <StyledUserName
      style={{
        margin: 0,
      }}
    >
      {message.from}
    </StyledUserName>
  );
};
