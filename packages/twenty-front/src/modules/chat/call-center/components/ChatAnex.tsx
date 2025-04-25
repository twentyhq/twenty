/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { useSendWhatsappMessages } from '@/chat/call-center/hooks/useSendWhatsappMessages';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { useUploadFileToBucket } from '@/chat/hooks/useUploadFileToBucket';
import { MessageType } from '@/chat/types/MessageType';
import { isWhatsappDocument } from '@/chat/utils/isWhatsappDocument';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Dispatch, SetStateAction, useContext } from 'react';
import { useIcons } from 'twenty-ui/display';

interface ChatAnexProps {
  setIsAnexOpen: Dispatch<SetStateAction<boolean>>;
  from: string;
}

interface LabelProps {
  isImage?: boolean;
}

const StyledMainContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  bottom: 50px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 180px;
`;

const StyledLabel = styled.label<LabelProps>`
  display: flex;
  padding: 6px 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.secondary};
  border-top-right-radius: ${({ theme, isImage }) =>
    isImage ? theme.border.radius.md : 0};
  border-top-left-radius: ${({ theme, isImage }) =>
    isImage ? theme.border.radius.md : 0};
  border-bottom-right-radius: ${({ theme, isImage }) =>
    isImage ? 0 : theme.border.radius.md};
  border-bottom-left-radius: ${({ theme, isImage }) =>
    isImage ? 0 : theme.border.radius.md};

  &:hover {
    background-color: ${({ theme }) => theme.background.quaternary};
  }
`;

const StyledInput = styled.input`
  display: none;
`;

export const ChatAnex = ({ setIsAnexOpen, from }: ChatAnexProps) => {
  const { selectedChat } = useContext(
    CallCenterContext,
  ) as CallCenterContextType;
  const { uploadFileToBucket } = useUploadFileToBucket();
  const { sendWhatsappMessage } = useSendWhatsappMessages();
  // const { messengerSendMessage } = useMessengerSendMessage();

  const { getIcon } = useIcons();
  const theme = useTheme();

  const DocIcon = getIcon('IconFile');
  const ImageIcon = getIcon('IconCamera');
  const VideoIcon = getIcon('IconVideo');

  const handleSendFile = async (file: File, type: MessageType) => {
    if (!selectedChat) return;

    // const identifier = isWhatsappDocument(selectedChat)
    //   ? `+${selectedChat.client.phone}`
    //   : selectedChat.client.id;

    const identifier = `${selectedChat.client.phone}`;

    if (!identifier) return;

    const url = await uploadFileToBucket({ file, type });

    const sendMessageInputBase = {
      integrationId: selectedChat.integrationId,
      to: identifier,
      type,
      from,
    };

    if (isWhatsappDocument(selectedChat)) {
      const sendMessageInput = {
        ...sendMessageInputBase,
        fileId: url,
      };

      sendWhatsappMessage(sendMessageInput);
    }
    // else {
    //   const messengerSendMessageInput = {
    //     ...sendMessageInputBase,
    //     fileUrl: url,
    //   };

    //   messengerSendMessage(messengerSendMessageInput);
    // }
  };

  return (
    <StyledMainContainer>
      <StyledLabel
        isImage
        style={{
          borderBottom: `1px solid ${theme.border.color.medium}`,
        }}
      >
        <ImageIcon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.primary}
          style={{ marginRight: theme.spacing(2) }}
        />
        Image
        <StyledInput
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleSendFile(file, MessageType.IMAGE);
              setIsAnexOpen(false);
            }
          }}
        />
      </StyledLabel>
      {selectedChat && (
        <StyledLabel
          isImage
          style={{
            borderBottom: `1px solid ${theme.border.color.medium}`,
          }}
        >
          <VideoIcon
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.primary}
            style={{ marginRight: theme.spacing(2) }}
          />
          Video
          <StyledInput
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleSendFile(file, MessageType.VIDEO);
                setIsAnexOpen(false);
              }
            }}
          />
        </StyledLabel>
      )}
      <StyledLabel>
        <DocIcon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.primary}
          style={{ marginRight: theme.spacing(2) }}
        />
        Document
        <StyledInput
          type="file"
          accept=".pdf, .doc, .docx, .txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleSendFile(file, MessageType.DOCUMENT);
              setIsAnexOpen(false);
            }
          }}
        />
      </StyledLabel>
    </StyledMainContainer>
  );
};
