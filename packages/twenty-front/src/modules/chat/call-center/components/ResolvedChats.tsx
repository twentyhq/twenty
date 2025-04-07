import { ChatCell } from '@/chat/call-center/components/ChatCell';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { statusEnum } from '@/chat/types/WhatsappDocument';
import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledResolvedTag = styled.div`
  background-color: #ddfcd8;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: #2a5822;
  margin-left: ${({ theme }) => theme.spacing(1)};
  padding: 6px ${({ theme }) => theme.spacing(2)};
  width: max-content;
`;

const StyledExpandDiv = styled.div<{ expanded: boolean }>`
  background-color: transparent;
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: ${({ expanded }) => (expanded ? 'flex' : 'none')};
  flex-direction: column;
  width: 100%;
  gap: 16px;
  padding: ${({ theme }) => theme.spacing(4)} 0;
`;

export const ResolvedChats = () => {
  const {
    selectedChatId,
    setSelectedChatId,
    whatsappChats /*, messengerChats*/,
  } = useContext(CallCenterContext) as CallCenterContextType;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const allChats = [...whatsappChats]; // ...messengerChats,

  return (
    <>
      <StyledDiv>
        <StyledResolvedTag>Resolved</StyledResolvedTag>
        <IconButton
          Icon={isExpanded ? IconChevronUp : IconChevronDown}
          onClick={toggleExpand}
        />
      </StyledDiv>
      <StyledExpandDiv expanded={isExpanded}>
        {allChats &&
          allChats.map((chat: any) => {
            if (chat.status === statusEnum.Resolved) {
              if (chat.isVisible === false) return null;
            } else {
              return null;
            }

            const chatId =
              chat.integrationId +
              (chat.client.phone
                ? `_${chat.client.phone}`
                : `_${chat.client.id}`);

            return (
              <ChatCell
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chatId}
                onSelect={() => setSelectedChatId(chatId)}
              />
            );
          })}
      </StyledExpandDiv>
    </>
  );
};
