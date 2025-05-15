import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Search } from '@/chat/call-center/components/Search';
import { StartChat } from '@/chat/call-center/components/StartChat';
import { TemplateMessage } from '@/chat/call-center/components/TemplateMessage';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { useGetWhatsappTemplates } from '@/chat/call-center/hooks/useGetWhatsappTemplates';
import { useWhatsappTemplateMessage } from '@/chat/call-center/hooks/useWhatsappTemplateMessage';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  Avatar,
  H1Title,
  H1TitleFontColor,
  IconX,
  useIcons,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledPaneHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  min-width: 24px;
`;

const StyledModal = styled(Modal)`
  padding: 0;
  width: 560px;
`;

const StyledModalHeader = styled(Modal.Header)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(12)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)}
    0;
`;

const StyledH1Title = styled(H1Title)`
  margin: 0;
`;

const StyledModalContent = styled(Modal.Content)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const PaneSideHeader = () => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [integrationId, setIntegrationId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const {
    sortChats,
    currentMember,
    isStartChatOpen,
    setIsStartChatOpen,
    startChatNumber,
    setStartChatNumber,
    startChatIntegrationId,
    setStartChatIntegrationId,
  } = useContext(CallCenterContext) as CallCenterContextType;

  const { data, loading } = useGetWhatsappTemplates(integrationId || '');
  const { sendWhatsappTemplateMessage } = useWhatsappTemplateMessage();

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (startChatNumber && startChatIntegrationId) {
      setPhoneNumber(startChatNumber);
      setIntegrationId(startChatIntegrationId);
    } else {
      setPhoneNumber(null);
      setIntegrationId(null);
    }
  }, [startChatNumber]);

  const handlePhoneUpdate = (newPhoneNumber: string | null) => {
    setPhoneNumber(newPhoneNumber);
  };

  const handleSelectedIntegrationId = (integrationId: string | null) => {
    setIntegrationId(integrationId);
  };

  const sendTemplateMessage = (
    templateName: string,
    message: string,
    language: string,
  ) => {
    const sendTemplateInput = {
      integrationId: integrationId,
      to: `+${phoneNumber}`,
      templateName,
      language,
      message,
      agent: {
        name: `${currentMember?.name.firstName} ${currentMember?.name.lastName}`,
        id: currentMember?.agentId,
      },
    };

    sendWhatsappTemplateMessage(sendTemplateInput);
    setPhoneNumber(null);
  };

  const IconSearch = getIcon('IconSearch');
  const IconEdit = getIcon('IconEdit');
  const IconSortDescending = getIcon('IconSortDescending');

  // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
  if (loading) return <></>;

  return (
    <>
      <StyledPaneHeaderContainer>
        <Avatar
          placeholder={currentWorkspaceMember?.name.firstName}
          avatarUrl={currentWorkspaceMember?.avatarUrl}
          size="xl"
          type="rounded"
        />
        <StyledActionsContainer>
          <StyledIconButton
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            variant="primary"
            accent="blue"
            size="medium"
            Icon={(props) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <IconSearch {...props} color={theme.font.color.inverted} />
            )}
          />
          <StyledIconButton
            onClick={() => sortChats()}
            variant="primary"
            accent="blue"
            size="medium"
            Icon={(props) => (
              <IconSortDescending
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                color={theme.font.color.inverted}
              />
            )}
          />
          <StyledIconButton
            onClick={() => setIsStartChatOpen(!isStartChatOpen)}
            variant="primary"
            accent="blue"
            size="medium"
            Icon={(props) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <IconEdit {...props} color={theme.font.color.inverted} />
            )}
          />
          {isStartChatOpen && (
            <StartChat
              isStartChatOpen={isStartChatOpen}
              setIsStartChatOpen={setIsStartChatOpen}
              onPhoneUpdate={handlePhoneUpdate}
              onIntegrationUpdate={handleSelectedIntegrationId}
            />
          )}
        </StyledActionsContainer>
      </StyledPaneHeaderContainer>

      {phoneNumber !== null && (
        <StyledModal>
          <StyledModalHeader>
            <StyledH1Title
              title={'Choose a template to send'}
              fontColor={H1TitleFontColor.Primary}
            />
            <IconButton
              Icon={IconX}
              size="medium"
              variant="tertiary"
              onClick={() => {
                setPhoneNumber(null);
                setStartChatNumber(null);
                setStartChatIntegrationId(null);
              }}
            />
          </StyledModalHeader>
          <StyledModalContent>
            <TemplateMessage
              templates={data?.templates}
              onTemplateUpdate={sendTemplateMessage}
            />
          </StyledModalContent>
        </StyledModal>
      )}

      <Search isOpen={isSearchOpen} />
    </>
  );
};
