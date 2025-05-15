/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { NoChats } from '@/chat/error-handler/components/NoChats';
import { NoSelectedChat } from '@/chat/error-handler/components/NoSelectedChat';
import { useUploadFileToBucket } from '@/chat/hooks/useUploadFileToBucket';
import { ChatContext } from '@/chat/internal/context/chatContext';
import { ChatContextType } from '@/chat/internal/types/chat';
import { validAudioTypes, validVideoTypes } from '@/chat/types/FileTypes';
import { MessageType } from '@/chat/types/MessageType';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Avatar, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { v4 } from 'uuid';
import { AnexModal } from './AnexModal';

interface StatusPillProps {
  status: 'Available' | 'Busy' | 'Away' | string;
}

const StyledRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(3)};
  padding-top: 0;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledUserName = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 600;
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledChatTitle = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 600;
  margin: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledStatusPill = styled.div<StatusPillProps>`
  background-color: ${({ status }) => {
    switch (status) {
      case 'Available':
        return '#DDFCD8';
      case 'Busy':
        return '#FED8D8';
      case 'Away':
        return '#FFF6D7';
      default:
        return 'gray';
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ status }) => {
    switch (status) {
      case 'Available':
        return '#2A5822';
      case 'Busy':
        return '#712727';
      case 'Away':
        return '#746224';
      default:
        return 'gray';
    }
  }};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding-block: ${({ theme }) => theme.spacing(0.5)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

const StyledTextPill = styled.p<StatusPillProps>`
  display: flex;
  margin: 0;
  padding: 0;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    align-self: center;
    background-color: ${({ status }) => {
      switch (status) {
        case 'Available':
          return '#2A5822';
        case 'Busy':
          return '#712727';
        case 'Away':
          return '#746224';
        default:
          return 'gray';
      }
    }};
    border-radius: 50%;
    margin-right: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledDateContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.spacing(6)};
`;

const StyledChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  position: relative;
`;

const StyledProfileCard = styled.div`
  align-items: center;
  display: flex;
`;

const StyledMessageContainer = styled.div<{ isSender: boolean }>`
  display: flex;
  flex-direction: ${({ isSender }) => (isSender ? 'row-reverse' : 'row')};
  align-items: center;
  width: 100%;
  justify-content: flex-start;
  border-radius: ${({ theme }) => theme.spacing(2)};
  transition: all 0.15s;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledMessageItem = styled.div<{ isSender: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isSender }) => (isSender ? 'flex-end' : 'flex-start')};
  gap: ${({ theme }) => theme.spacing(1.5)};
  width: auto;
  max-width: 70%;
  margin-left: ${({ isSender, theme }) => (isSender ? '0' : theme.spacing(2))};
  margin-right: ${({ isSender, theme }) => (isSender ? theme.spacing(2) : '0')};
`;

const StyledNameAndTimeContainer = styled.div<{ isSender: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ isSender }) => (isSender ? 'row-reverse' : 'row')};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledMessage = styled.div<{ isSender: boolean }>`
  max-width: ${({ isSender }) => (isSender ? 'none' : '100%')};
  text-align: left;
`;

const StyledLine = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  padding: 0;
  word-break: break-word;
`;

const StyledImageContainer = styled.div<{ isSender: boolean }>`
  display: flex;
  flex-direction: ${({ isSender }) => (isSender ? 'row-reverse' : 'row')};
`;

const StyledImage = styled.img`
  align-items: end;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  height: 200px;
  object-fit: cover;
  width: 200px;
`;

const StyledDocumentContainer = styled.div<{ isSender: boolean }>`
  display: flex;
  flex-direction: ${({ isSender }) => (isSender ? 'row-reverse' : 'row')};
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDocument = styled.a`
  color: ${({ theme }) => theme.font.color.primary};
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledAudio = styled.audio<{ isSender: boolean }>`
  display: block;
  margin-left: ${({ isSender }) => (isSender ? 'auto' : '0')};
  margin-right: ${({ isSender }) => (isSender ? '0' : 'auto')};
`;

const StyledVideo = styled.video<{ isSender: boolean }>`
  display: block;
  margin-left: ${({ isSender }) => (isSender ? 'auto' : '0')};
  margin-right: ${({ isSender }) => (isSender ? '0' : 'auto')};
  max-height: 150px;
`;

const StyledAvatarMessage = styled.div`
  align-self: flex-start;
  margin-top: 4px;
`;

const StyledInputContainer = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: space-between;
  margin-inline: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)};
  position: relative;
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledAnexDiv = styled.div`
  bottom: ${({ theme }) => theme.spacing(3)};
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: absolute;
`;

const StyledInput = styled.textarea`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.tertiary};
  padding-right: ${({ theme }) => theme.spacing(10)};
  padding-left: ${({ theme }) => theme.spacing(12)};
  margin-top: ${({ theme }) => theme.spacing(3)};
  min-height: 20px;
  max-height: 200px;
`;

const StyledDiv = styled.div`
  bottom: ${({ theme }) => theme.spacing(3.5)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: 0;
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 26px;
  padding: '5px';
  min-width: 26px;
`;

const StyledModalOverlay = styled(motion.div)`
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  user-select: none;
  width: 100%;
  z-index: 1000;
`;

const StyledModalImage = styled.img`
  max-width: 90%;
  max-height: 90dvh;
  object-fit: contain;
`;

const StyledBalloon = styled.div<{ isSender: boolean }>`
  background-color: ${({ isSender, theme }) =>
    isSender
      ? theme.name === 'dark'
        ? '#171E2C'
        : '#E8EFFD'
      : theme.background.tertiary};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.spacing(3)};
  max-width: max-content;
  word-wrap: break-word;
`;

const StyledContainer = styled.div<{ isSender: boolean }>`
  display: flex;
  justify-content: ${({ isSender }) => (isSender ? 'flex-end' : 'none')};
  align-items: ${({ isSender }) => (isSender ? 'flex-end' : 'none')};
  width: 100%;
`;

export const OpenChat = () => {
  const { getIcon } = useIcons();
  const theme = useTheme();

  const {
    userChat,
    openChat,
    handleSendMessage,
    newMessage,
    setNewMessage,
    otherUserStatus,
    formatDate,
    setIsAnexOpen,
    isAnexOpen,
    findUserAvatar,
    goingToMessageIndex,
    setGoingToMessageIndex,
  } = useContext(ChatContext) as ChatContextType;

  const AnexIcon = getIcon('IconPaperclip');
  const OpenOnAnotherTab = getIcon('IconExternalLink');

  const { enqueueSnackBar } = useSnackBar();
  const { uploadFileToBucket } = useUploadFileToBucket();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | undefined>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ChatName =
    openChat?.senderId === userChat?.userId
      ? openChat?.receiverName
      : openChat?.senderName;

  const ChatIcon =
    openChat?.senderId === userChat?.userId
      ? findUserAvatar(openChat?.receiverId)
      : findUserAvatar(openChat?.senderId);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [openChat?.messages]);

  useEffect(() => {
    if (
      typeof goingToMessageIndex === 'number' &&
      messageRefs.current[goingToMessageIndex]
    ) {
      messageRefs.current[goingToMessageIndex]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'end',
        block: 'center',
      });

      setTimeout(() => {
        setGoingToMessageIndex(undefined);
      }, 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goingToMessageIndex]);

  if (userChat?.chats.length === 0) {
    return <NoChats />;
  }

  if (!openChat) {
    return <NoSelectedChat />;
  }

  const formatMessageContent = (message: string | undefined) => {
    return message?.split('\n').map((str, index) => (
      <StyledLine key={index}>
        {str}
        {index !== message.split('\n').length - 1 && <br />}
      </StyledLine>
    ));
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = ev.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    setNewMessage(ev.target.value);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc(undefined);
  };

  const user = `${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`;

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    const chunks: Blob[] = [];

    try {
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, {
          type: 'audio/webm',
        });
        setAudioBlob(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      enqueueSnackBar('Failed to start recording. Check microphone access.', {
        variant: SnackBarVariant.Warning,
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleSendMessageAndScroll = async (chatId: string | undefined) => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'initial';
    }

    if (audioBlob) {
      if (!audioBlob) {
        enqueueSnackBar('No audio recorded', {
          variant: SnackBarVariant.Warning,
        });
        return;
      }

      const uniqueFilename = `${chatId}-${v4()}.weba`;
      const audioFile = new File([audioBlob], uniqueFilename, {
        type: 'audio/webm',
      });

      const urlStorage = await uploadFileToBucket({
        file: audioFile,
        type: MessageType.AUDIO,
        isInternal: true,
      });

      handleSendMessage(chatId, 'audio', urlStorage, uniqueFilename);
    } else if (newMessage.trim() !== '') {
      handleSendMessage(chatId);
    }

    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight; // Scroll to bottom after sending message
    }
  };

  const IconX = getIcon('IconX');
  const IconMicrophone = getIcon('IconMicrophone');
  const IconArrowRight = getIcon('IconArrowRight');

  return (
    <StyledRightContainer>
      <StyledChatHeader>
        <StyledProfileCard>
          <Avatar
            placeholder={ChatName}
            avatarUrl={ChatIcon}
            size="xl"
            type={'rounded'}
            placeholderColorSeed={ChatName}
          />
          <StyledChatTitle>{ChatName}</StyledChatTitle>
          <StyledStatusPill status={otherUserStatus}>
            <StyledTextPill status={otherUserStatus}>
              {otherUserStatus}
            </StyledTextPill>
          </StyledStatusPill>
        </StyledProfileCard>
      </StyledChatHeader>
      <StyledChatContainer ref={chatContainerRef}>
        {openChat &&
          openChat.messages.map((message, index) => {
            const isSender = message?.senderName === user;

            let messageContent;

            switch (message.type) {
              case 'img':
                messageContent = (
                  <StyledImageContainer isSender={isSender}>
                    <StyledImage
                      src={message.text}
                      onClick={() => {
                        setModalImageSrc(message.text);
                        setIsModalOpen(true);
                      }}
                    />
                  </StyledImageContainer>
                );
                break;
              case 'audio':
                messageContent = (
                  <StyledAudio isSender={isSender} controls>
                    {validAudioTypes.map((type) => (
                      <source key={type} src={message.text} type={type} />
                    ))}
                  </StyledAudio>
                );
                break;
              case 'video':
                messageContent = (
                  <StyledVideo isSender={isSender} controls>
                    {validVideoTypes.map((type) => (
                      <source key={type} src={message.text} type={type} />
                    ))}
                  </StyledVideo>
                );
                break;
              case 'doc': {
                const msg = message?.text
                  ? message.text.split('/').pop()?.split('?')[0]
                  : null;
                messageContent = (
                  <StyledDocumentContainer isSender={isSender}>
                    <StyledDocument href={message.text} target="_blank">
                      {msg}
                    </StyledDocument>
                    <OpenOnAnotherTab
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                      color={theme.font.color.primary}
                    />
                  </StyledDocumentContainer>
                );
                break;
              }
              default:
                messageContent = (
                  <StyledMessage isSender={isSender}>
                    {formatMessageContent(message.text)}
                  </StyledMessage>
                );
                break;
            }

            return (
              <StyledMessageContainer
                isSender={isSender}
                key={index}
                ref={(el) => (messageRefs.current[index] = el)}
                style={{
                  backgroundColor:
                    index === goingToMessageIndex ? '#F1F1F1' : 'transparent',
                  padding: index === goingToMessageIndex ? '4px' : undefined,
                  width: index === goingToMessageIndex ? '98%' : undefined,
                  borderRadius: '8px',
                  transition: 'all 0.15s',
                }}
              >
                <StyledAvatarMessage>
                  <Avatar
                    avatarUrl={findUserAvatar(message.senderId)}
                    placeholder={message.senderName}
                    placeholderColorSeed={message.senderName}
                    type={'rounded'}
                    size="xl"
                  />
                </StyledAvatarMessage>
                <StyledContainer isSender={isSender}>
                  <StyledMessageItem key={index} isSender={isSender}>
                    <StyledBalloon isSender={isSender}>
                      {messageContent}
                    </StyledBalloon>
                    <StyledNameAndTimeContainer isSender={isSender}>
                      <StyledUserName
                        style={{
                          margin: 0,
                        }}
                      >
                        {message.senderName}
                      </StyledUserName>
                      <StyledDateContainer>
                        {formatDate(message.createdAt).time}
                      </StyledDateContainer>
                    </StyledNameAndTimeContainer>
                  </StyledMessageItem>
                </StyledContainer>
              </StyledMessageContainer>
            );
          })}
      </StyledChatContainer>
      {openChat && (
        <StyledInputContainer>
          <StyledAnexDiv>
            <IconButton
              Icon={AnexIcon}
              accent="default"
              variant="tertiary"
              onClick={() => setIsAnexOpen(!isAnexOpen)}
            />
          </StyledAnexDiv>
          {isAnexOpen && <AnexModal />}
          <StyledInput
            className="new-message-input"
            placeholder="Message"
            onInput={handleInputChange}
            value={newMessage}
            ref={textareaRef}
            // onChange={(e) => {
            //   setNewMessage(e.target.value);
            // }}
            // onKeyDown={(e) => {
            //   if (e.key === 'Enter' && newMessage.trim() !== '') {
            //     handleSendMessageAndScroll(openChat?.chatId);
            //   }
            // }}
          />
          <StyledDiv>
            <StyledIconButton
              Icon={
                isRecording
                  ? (props) => (
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      <IconX {...props} color={theme.font.color.inverted} />
                    )
                  : (props) => (
                      <IconMicrophone
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        color={theme.font.color.inverted}
                      />
                    )
              }
              onClick={handleToggleRecording}
              variant="primary"
              accent={isRecording ? 'danger' : 'blue'}
              size="medium"
            />
            <StyledIconButton
              Icon={(props) => (
                <IconArrowRight
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...props}
                  color={theme.font.color.inverted}
                />
              )}
              onClick={() => handleSendMessageAndScroll(openChat?.chatId)}
              variant="primary"
              accent="blue"
              size="medium"
            />
          </StyledDiv>
          {/* <StyledIconButton
            Icon={IconArrowRight}
            onClick={() => handleSendMessageAndScroll(openChat?.chatId)}
            variant="primary"
            accent="blue"
            size="medium"
          /> */}
        </StyledInputContainer>
      )}
      {isModalOpen && modalImageSrc && (
        <StyledModalOverlay onClick={closeModal}>
          <StyledModalImage
            src={modalImageSrc}
            onClick={(ev) => ev.stopPropagation()}
          />
        </StyledModalOverlay>
      )}
    </StyledRightContainer>
  );
};
