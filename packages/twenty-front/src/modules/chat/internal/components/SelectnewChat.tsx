import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { ChatContext } from '../context/chatContext';
import { ChatContextType } from '../types/chat';

export const StyledInput = styled.input`
  border: none;
  border-top: none;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;
  border-top-left-radius: ${({ theme }) => theme.border.radius.md};
  border-top-right-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 19px;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

const StyledMainContainer = styled.div`
  position: absolute;
  right: 0;
  top: 50px;
  background-color: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  z-index: 100;
`;

export const SelectNewChat = () => {
  const [searchText, setSearchText] = useState('');

  const { getIcon } = useIcons();

  const { handleAddChat, workspaceUsers, setIsNewChatOpen, setIsSearching } =
    useContext(ChatContext) as ChatContextType;

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  return (
    <StyledMainContainer>
      <StyledInput
        value={searchText}
        autoFocus
        onFocus={() => {
          setIsSearching(true);
        }}
        onBlur={() => {
          setIsSearching(false);
        }}
        placeholder="Search"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setSearchText(event.target.value)
        }
      />
      <DropdownMenuItemsContainer>
        {workspaceUsers.map((user) => (
          <MenuItem
            testId={`select-filter`}
            onClick={() => {
              handleAddChat(
                currentWorkspaceMember?.id,
                currentWorkspaceMember?.name.firstName +
                  ' ' +
                  currentWorkspaceMember?.name.lastName,
                user.userId,
                user.name,
                currentWorkspace?.id,
                currentWorkspaceMember?.avatarUrl,
                user.avatarUrl,
              );
              setIsNewChatOpen(false);
            }}
            LeftIcon={getIcon('IconBrandWechat')}
            text={user.name}
          />
        ))}
      </DropdownMenuItemsContainer>
    </StyledMainContainer>
  );
};
