import { Details } from '@/chat/call-center/components/Details';
import { TransferChatOptionsDropdown } from '@/chat/call-center/components/TransferChatOptionsDropdown';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { TicketDataType } from '@/chat/types/TicketDataType';
import { isWhatsappDocument } from '@/chat/utils/isWhatsappDocument';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { Avatar, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  position: relative;
`;

const StyledChatTitle = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 600;
  margin: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledDiv = styled.div`
  align-items: center;
  display: flex;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-right: 8px;
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  padding: 5px;
  width: 24px;
  min-width: 24px;
`;

export const PaneChatHeader = () => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { selectedChat, finalizeService } = useContext(
    CallCenterContext,
  ) as CallCenterContextType;
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  if (!selectedChat) return;

  const userData: TicketDataType = {
    name: selectedChat.client.name ? selectedChat.client.name : '',
    phone: isWhatsappDocument(selectedChat) ? selectedChat.client.phone : '...',
    email: 'email@example.com',
    status: selectedChat.status,
    sector: selectedChat.sector,
    timeline: selectedChat.timeline,
  };

  const IconX = getIcon('IconX');
  const IconDotsVertical = getIcon('IconDotsVertical');

  return (
    <>
      <StyledChatHeader>
        <StyledDiv>
          <Avatar
            placeholder={selectedChat.client.name}
            size="xl"
            type={'rounded'}
            placeholderColorSeed={selectedChat.client.name}
          />
          <StyledChatTitle>{selectedChat.client.name}</StyledChatTitle>
        </StyledDiv>
        <StyledActionsContainer>
          <StyledIconButton
            onClick={() => setIsModalOpen(!isModalOpen)}
            variant="primary"
            accent="danger"
            size="medium"
            Icon={(props) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <IconX {...props} color={theme.font.color.inverted} />
            )}
          />
          <TransferChatOptionsDropdown />
          <StyledIconButton
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            variant="primary"
            accent="blue"
            size="medium"
            Icon={(props) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <IconDotsVertical {...props} color={theme.font.color.inverted} />
            )}
          />
          {isDetailsOpen && (
            <Details
              ticketData={userData}
              setIsDetailsOpen={setIsDetailsOpen}
            />
          )}
        </StyledActionsContainer>
      </StyledChatHeader>
      <ConfirmationModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title={'Close service'}
        subtitle={
          <>
            {
              'This will end the chat and change the status of the service to closed'
            }
          </>
        }
        onConfirmClick={finalizeService}
        confirmButtonText={'Close'}
      />
    </>
  );
};
