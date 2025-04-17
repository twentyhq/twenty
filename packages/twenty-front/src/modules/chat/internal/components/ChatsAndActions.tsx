/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Search } from '@/chat/internal/components/Search';
import { SelectNewChat } from '@/chat/internal/components/SelectnewChat';
import { SelectStatus } from '@/chat/internal/components/SelectStatus';
import { ChatContext } from '@/chat/internal/context/chatContext';
import { ChatContextType } from '@/chat/internal/types/chat';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { Avatar, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

interface StatusPillProps {
  status: 'Available' | 'Busy' | 'Away' | string;
}

const StyledLeftContainer = styled.div`
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  min-height: max-content;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  width: 400px;
`;

const StyledLeftHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledItemChat = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
  transition: background-color 0.2s;
`;

const StyledUserName = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 600;
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledLastMessagePreview = styled.p`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.secondary};
  margin: 0;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledChatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow-y: auto;
`;

const StyledAvatarAndNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDateAndUnreadMessagesContainer = styled.div`
  color: ${({ theme }) => theme.color.gray50};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
`;

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledUnreadMessages = styled.div`
  background-color: #1961ed;
  color: ${({ theme }) => theme.font.color.inverted};
  width: ${({ theme }) => theme.spacing(4)};
  height: ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: 600;
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  min-width: 24px;
`;

const StyledClickableAvatar = styled.div<StatusPillProps>`
  cursor: pointer;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    right: 2px;
    content: '';
    width: 8px;
    height: 8px;
    background-color: ${({ status }) => {
      switch (status) {
        case 'Available':
          return '#2A5822';
        case 'Busy':
          return '#712727';
        case 'Away':
          return '#746224';
        default:
          return 'gray';
      }
    }};
    border-radius: 50%;
  }
`;

export const ChatsAndActions = () => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const {
    userChat,
    chatId,
    setChatId,
    isNewChatOpen,
    setIsNewChatOpen,
    formatDate,
    isStatusOpen,
    setIsStatusOpen,
    thisUserStatus,
    isSearchOpen,
    setIsSearchOpen,
    sortChats,
    findUserAvatar,
  } = useContext(ChatContext) as ChatContextType;

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const IconSearch = getIcon('IconSearch');
  const IconEdit = getIcon('IconEdit');
  const IconSortDescending = getIcon('IconSortDescending');

  return (
    <StyledLeftContainer>
      <StyledLeftHeaderContainer>
        <StyledClickableAvatar status={thisUserStatus}>
          <Avatar
            placeholder={currentWorkspaceMember?.name.firstName}
            avatarUrl={currentWorkspaceMember?.avatarUrl}
            size="xl"
            type={'rounded'}
            onClick={() => setIsStatusOpen(!isStatusOpen)}
          />
        </StyledClickableAvatar>
        {isStatusOpen && <SelectStatus />}
        <StyledActionsContainer>
          <StyledIconButton
            Icon={(props) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <IconSearch {...props} color={theme.font.color.inverted} />
            )}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            variant="primary"
            accent="blue"
            size="medium"
          />
          <StyledIconButton
            Icon={(props) => (
              <IconSortDescending
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                color={theme.font.color.inverted}
              />
            )}
            onClick={() => sortChats()}
            variant="primary"
            accent="blue"
            size="medium"
          />
          <StyledIconButton
            Icon={(props) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <IconEdit {...props} color={theme.font.color.inverted} />
            )}
            onClick={() => setIsNewChatOpen(!isNewChatOpen)}
            variant="primary"
            accent="blue"
            size="medium"
          />
        </StyledActionsContainer>
        {isNewChatOpen && <SelectNewChat />}
      </StyledLeftHeaderContainer>
      {isSearchOpen ? (
        <Search />
      ) : (
        <StyledChatsContainer>
          {userChat?.chats.map((chat, index) => {
            const otherUserName =
              chat.senderId === userChat.userId
                ? chat.receiverName
                : chat.senderName;

            const otherUserAvatarUrl =
              chat?.senderId === userChat?.userId
                ? findUserAvatar(chat?.receiverId)
                : findUserAvatar(chat?.senderId);

            return (
              <StyledItemChat
                key={index}
                onClick={() => setChatId(chat.chatId)}
                style={{
                  backgroundColor:
                    chatId === chat.chatId
                      ? theme.background.quaternary
                      : 'transparent',
                }}
              >
                <StyledAvatarAndNameContainer>
                  <Avatar
                    avatarUrl={otherUserAvatarUrl}
                    placeholderColorSeed={otherUserName}
                    placeholder={otherUserName}
                    type={'rounded'}
                    size="lg"
                    key={chat.senderId}
                  />
                  <div>
                    <StyledUserName>{otherUserName}</StyledUserName>
                    <StyledLastMessagePreview>
                      {`${chat.lastMessageSenderName}: ${chat.lastMessagePreview?.at(19) === ' ' ? chat.lastMessagePreview.slice(0, 19) : chat.lastMessagePreview?.slice(0, 20)}` +
                        ((chat.lastMessagePreview?.length ?? 0 > 20)
                          ? '...'
                          : '')}
                    </StyledLastMessagePreview>
                  </div>
                </StyledAvatarAndNameContainer>
                <StyledDateAndUnreadMessagesContainer>
                  {formatDate(chat.lastMessageDate).time}
                  {chat.unreadMessages > 0 && (
                    <StyledUnreadMessages>
                      {chat.unreadMessages}
                    </StyledUnreadMessages>
                  )}
                </StyledDateAndUnreadMessagesContainer>
              </StyledItemChat>
            );
          })}
        </StyledChatsContainer>
      )}
    </StyledLeftContainer>
  );
};
