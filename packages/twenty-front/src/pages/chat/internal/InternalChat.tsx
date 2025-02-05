import { useIcons } from 'twenty-ui';
import styled from '@emotion/styled';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { ChatsAndActions } from '@/chat/internal/components/ChatsAndActions';
import { OpenChat } from '@/chat/internal/components/OpenChat';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useContext } from 'react';
import { ChatContext } from '@/chat/internal/context/chatContext';
import { ChatContextType } from '@/chat/internal/types/chat';

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

export const Chat = () => {
  const { getIcon } = useIcons();

  const {
    setIsNewChatOpen,
    // setIsSearchOpen,
    setIsStatusOpen,
    isNewChatOpen,
    // isSearchOpen,
    isStatusOpen,
    isSearching,
  } = useContext(ChatContext) as ChatContextType;

  return (
    <PageContainer>
      <PageHeader Icon={getIcon('IconBrandWechat')} title="Chat" />
      <PageBody>
        <StyledMainContainer
          onClick={() => {
            isNewChatOpen && !isSearching && setIsNewChatOpen(false);
            // isSearchOpen && !isSearching && setIsSearchOpen(false);
            isStatusOpen && setIsStatusOpen(false);
          }}
        >
          <ChatsAndActions />
          <OpenChat />
        </StyledMainContainer>
      </PageBody>
    </PageContainer>
  );
};
