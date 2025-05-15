import styled from '@emotion/styled';
import { useContext } from 'react';
import { Avatar } from 'twenty-ui/display';
import { ChatContext } from '../context/chatContext';
import { ChatContextType } from '../types/chat';

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin-top: ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
  margin: 0 auto;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.strong};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchBar = styled.input`
  padding: ${({ theme }) => theme.spacing(2)};
  border: none;
  outline: none;
  width: 100%;
  background-color: ${({ theme }) => theme.background.tertiary};
  color: ${({ theme }) => theme.font.color.tertiary};

  ::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledMessagesContainer = styled.div`
  display: flex;
  align-items: center;
  margin-inline: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.background.quaternary};
    border-radius: ${({ theme }) => theme.border.radius.md};
  }
`;

const StyledMessagesTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding-inline: ${({ theme }) => theme.spacing(4)};
`;

const StyledResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  max-height: 50%;
  overflow-y: auto;
`;

const StyledUserName = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledSenderName = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing(2)};

  ::after {
    content: '';
    display: inline-block;
    width: 3px;
    height: 3px;
    border-radius: 100%;
    background-color: ${({ theme }) => theme.color.gray50};
    margin-inline: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledMessageText = styled.p`
  color: ${({ theme }) => theme.font.color.secondary};
  margin: 0;
  padding: 0;
`;

export const Search = () => {
  const {
    searchQuery,
    setSearchQuery,
    handleSearch,
    queryResult,
    setIsSearching,
    findUserAvatar,
    findAndSetChat,
    goToMessage,
  } = useContext(ChatContext) as ChatContextType;

  return (
    <StyledMainContainer>
      <StyledSearchBarContainer>
        <StyledSearchBar
          value={searchQuery}
          onFocus={() => {
            setIsSearching(true);
          }}
          onBlur={() => {
            setIsSearching(false);
          }}
          placeholder="Search for a member or message"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim() !== '') {
              handleSearch(searchQuery);
            }
          }}
        />
      </StyledSearchBarContainer>

      {(queryResult?.users.length || 0) > 0 && (
        <StyledMessagesTitle>Member</StyledMessagesTitle>
      )}

      {(queryResult?.users.length || 0) > 0 && (
        <StyledResultsContainer>
          {queryResult?.users &&
            queryResult.users.map((user) => (
              <StyledMessagesContainer
                onClick={() => findAndSetChat(user.userId)}
              >
                <Avatar
                  avatarUrl={findUserAvatar(user.userId)}
                  placeholder={user.name}
                  placeholderColorSeed={user.name}
                  type="rounded"
                  size="lg"
                />
                <StyledUserName>{user.name}</StyledUserName>
              </StyledMessagesContainer>
            ))}
        </StyledResultsContainer>
      )}

      {(queryResult?.messages.length || 0) > 0 && (
        <StyledMessagesTitle>Message</StyledMessagesTitle>
      )}

      {(queryResult?.messages.length || 0) > 0 && (
        <StyledResultsContainer>
          {queryResult?.messages &&
            queryResult.messages.map((message) => (
              <StyledMessagesContainer
                onClick={() => goToMessage(message.chatId || '', message.id)}
              >
                <Avatar
                  avatarUrl={findUserAvatar(message.senderId)}
                  placeholder={message.senderName}
                  placeholderColorSeed={message.senderName}
                  type="rounded"
                  size="lg"
                />
                <StyledSenderName>{message.senderName}</StyledSenderName>
                <StyledMessageText>
                  {message.text?.slice(0, 20)}
                  {(message.text?.length || 0) > 19 && '...'}
                </StyledMessageText>
              </StyledMessagesContainer>
            ))}
        </StyledResultsContainer>
      )}
    </StyledMainContainer>
  );
};
