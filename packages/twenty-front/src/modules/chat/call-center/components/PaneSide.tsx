import { ChatCell } from '@/chat/call-center/components/ChatCell';
import { PaneSideHeader } from '@/chat/call-center/components/PaneSideHeader';
import { PaneSideTabs } from '@/chat/call-center/components/PaneSideTabs';
import { ResolvedChats } from '@/chat/call-center/components/ResolvedChats';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { statusEnum } from '@/chat/types/WhatsappDocument';
import { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';
import { useContext } from 'react';

const StyledPaneSideContainer = styled.div`
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  min-height: max-content;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  width: 400px;
`;

const StyledTabListContainer = styled.div`
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  width: 100%;
`;

const StyledChatsContainer = styled.div<{ isScrollable: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)} 0;
  height: 80dvh;
  overflow-y: ${({ isScrollable }) => (isScrollable ? 'scroll' : 'unset')};
`;

export const PaneSide = () => {
  const {
    selectedChatId,
    setSelectedChatId,
    TAB_LIST_COMPONENT_ID,
    whatsappChats,
    unreadTabMessages,
    // messengerChats,
  } = useContext(CallCenterContext) as CallCenterContextType;

  const tabs: SingleTabProps[] = [
    {
      id: 'mine',
      title: 'Mine',
      incomingMessages: unreadTabMessages?.unreadMine,
    },
    {
      id: 'unassigned',
      title: 'Unassigned',
      incomingMessages: unreadTabMessages?.unreadUnassigned,
    },
    {
      id: 'abandoned',
      title: 'Abandoned',
      incomingMessages: unreadTabMessages?.unreadAbandoned,
    },
  ];

  const nonResolvedWhatsappChats = whatsappChats.filter(
    (chat) => chat.status !== statusEnum.Resolved,
  );

  const isScrollable = nonResolvedWhatsappChats.length > 5;

  const renderWhatsappChats = () => {
    return whatsappChats.map((chat: any) => {
      if (chat.status === statusEnum.Resolved) return <></>;

      return (
        <ChatCell
          key={chat.client.phone}
          platform="whatsapp"
          chat={chat}
          isSelected={
            selectedChatId === `${chat.integrationId}_${chat.client.phone}`
          }
          onSelect={() => {
            setSelectedChatId(`${chat.integrationId}_${chat.client.phone}`);
          }}
        />
      );
    });
  };

  // const renderMessengerChats = () => {
  //   return messengerChats.map((chat: any) => {
  //     if (chat.status === statusEnum.Resolved) return <></>;

  //     return (
  //       <ChatCell
  //         key={chat.client.id}
  //         platform="messenger"
  //         chat={chat}
  //         isSelected={
  //           selectedChatId === `${chat.integrationId}_${chat.client.id}`
  //         }
  //         onSelect={() =>
  //           setSelectedChatId(`${chat.integrationId}_${chat.client.id}`)
  //         }
  //       />
  //     );
  //   });
  // };

  return (
    <StyledPaneSideContainer>
      <PaneSideHeader />
      <div>
        <StyledTabListContainer>
          <PaneSideTabs
            loading={false}
            tabListId={TAB_LIST_COMPONENT_ID}
            tabs={tabs}
          />
        </StyledTabListContainer>
        <StyledChatsContainer isScrollable={isScrollable}>
          {renderWhatsappChats()}
          <ResolvedChats />
        </StyledChatsContainer>
      </div>
    </StyledPaneSideContainer>
  );
};
