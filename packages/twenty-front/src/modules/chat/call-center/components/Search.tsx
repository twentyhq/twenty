import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import {
  FilteredMessage,
  FilteredUser,
} from '@/chat/call-center/types/SearchType';
import styled from '@emotion/styled';
import { useContext, useEffect, useState } from 'react';
import { Avatar } from 'twenty-ui/display';

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

export const Search = ({ isOpen }: { isOpen: boolean }) => {
  const { setSelectedChatId, handleSearch } = useContext(
    CallCenterContext,
  ) as CallCenterContextType;

  const [searchQuery, setSearchQuery] = useState('');
  const [queryResult, setQueryResult] = useState<{
    users: FilteredUser[];
    messages: FilteredMessage[];
  }>({
    users: [],
    messages: [],
  });

  const performSearch = (query: string) => {
    const result = handleSearch(query);
    setQueryResult(result);
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setQueryResult({ users: [], messages: [] });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <StyledMainContainer>
      <StyledSearchBarContainer>
        <StyledSearchBar
          value={searchQuery}
          placeholder="Search for a member or message"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim() !== '') {
              performSearch(searchQuery);
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
                key={user.agent.agentId}
                onClick={() => setSelectedChatId(user.chatId)}
              >
                <Avatar
                  avatarUrl={user.agent.avatarUrl}
                  placeholder={user.agent.name.firstName}
                  placeholderColorSeed={user.agent.name.firstName}
                  type="rounded"
                  size="lg"
                />
                <StyledUserName>
                  {user.agent.name.firstName} {user.agent.name.lastName}
                </StyledUserName>
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
                key={message.chatId}
                onClick={() => setSelectedChatId(message.chatId)}
              >
                <Avatar
                  avatarUrl={message.chat.client.name}
                  placeholder={message.chat.client.name}
                  placeholderColorSeed={message.chat.client.name}
                  type="rounded"
                  size="lg"
                />
                <StyledSenderName>
                  {message.chat.client.name?.slice(0, 10)}
                </StyledSenderName>
                <StyledMessageText>
                  {message.message?.slice(0, 20)}
                  {(message.message?.length || 0) > 19 && '...'}
                </StyledMessageText>
              </StyledMessagesContainer>
            ))}
        </StyledResultsContainer>
      )}
    </StyledMainContainer>
  );
};
