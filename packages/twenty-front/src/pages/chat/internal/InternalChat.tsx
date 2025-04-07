import { ChatsAndActions } from '@/chat/internal/components/ChatsAndActions';
import { OpenChat } from '@/chat/internal/components/OpenChat';
import { ChatContext } from '@/chat/internal/context/chatContext';
import { ChatContextType } from '@/chat/internal/types/chat';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui/display';

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
