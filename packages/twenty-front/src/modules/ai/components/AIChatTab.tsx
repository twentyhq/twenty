import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import { IconHistory } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

import { DropZone } from '@/activities/files/components/DropZone';
import { AgentChatFileUploadButton } from '@/ai/components/internal/AgentChatFileUploadButton';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { AIChatEmptyState } from '@/ai/components/AIChatEmptyState';
import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { AIChatStandaloneError } from '@/ai/components/AIChatStandaloneError';
import { AIChatContextUsageButton } from '@/ai/components/internal/AIChatContextUsageButton';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { AgentChatContextPreview } from '@/ai/components/internal/AgentChatContextPreview';
import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

const StyledContainer = styled.div<{ isDraggingFile: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  height: ${({ isDraggingFile }) =>
    isDraggingFile ? `calc(100% - 24px)` : '100%'};
  padding: ${({ isDraggingFile, theme }) =>
    isDraggingFile ? theme.spacing(3) : '0'};
  display: flex;
  flex-direction: column;
`;

const StyledInputArea = styled.div<{ isMobile: boolean }>`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-inline: ${({ theme }) => theme.spacing(3)};
  padding-block: ${({ theme, isMobile }) => (isMobile ? 0 : theme.spacing(3))};
  background: ${({ theme }) => theme.background.primary};
`;

const StyledInputBox = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 140px;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0px 0px 0px 3px ${({ theme }) => theme.color.transparent.blue2};
  }
`;

const StyledTextAreaWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledChatTextArea = styled(TextArea)`
  && {
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
  }

  &&:focus {
    border: none;
    box-shadow: none;
  }
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
  width: calc(100% - 24px);
`;

const StyledButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(0.5)};
  justify-content: flex-end;
`;

export const AIChatTab = () => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const isMobile = useIsMobile();
  const { isLoading, messages, isStreaming, error } =
    useAgentChatContextOrThrow();

  const [agentChatInput, setAgentChatInput] =
    useRecoilState(agentChatInputState);

  const { uploadFiles } = useAIChatFileUpload();
  const { navigateCommandMenu } = useCommandMenu();

  return (
    <StyledContainer
      isDraggingFile={isDraggingFile}
      onDragEnter={() => setIsDraggingFile(true)}
    >
      {isDraggingFile && (
        <DropZone
          setIsDraggingFile={setIsDraggingFile}
          onUploadFiles={uploadFiles}
        />
      )}
      {!isDraggingFile && (
        <>
          {messages.length !== 0 && (
            <StyledScrollWrapper
              componentInstanceId={AI_CHAT_SCROLL_WRAPPER_ID}
            >
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const isLastMessageStreaming = isStreaming && isLastMessage;
                const isLastAssistantMessage =
                  isLastMessage && message.role === AgentMessageRole.ASSISTANT;
                const shouldShowError = error && isLastAssistantMessage;

                return (
                  <AIChatMessage
                    isLastMessageStreaming={isLastMessageStreaming}
                    message={message}
                    key={message.id}
                    error={shouldShowError ? error : null}
                  />
                );
              })}
              {error &&
                !isStreaming &&
                messages.at(-1)?.role === AgentMessageRole.USER && (
                  <AIChatStandaloneError error={error} />
                )}
            </StyledScrollWrapper>
          )}
          {messages.length === 0 && !error && !isLoading && (
            <AIChatEmptyState />
          )}
          {messages.length === 0 && error && !isLoading && (
            <AIChatStandaloneError error={error} />
          )}
          {isLoading && messages.length === 0 && <AIChatSkeletonLoader />}

          <StyledInputArea isMobile={isMobile}>
            <AgentChatContextPreview />
            <StyledInputBox>
              <StyledTextAreaWrapper>
                <StyledChatTextArea
                  textAreaId={AI_CHAT_INPUT_ID}
                  placeholder={t`Ask, search or make anything...`}
                  value={agentChatInput}
                  onChange={(value) => setAgentChatInput(value)}
                  minRows={3}
                  maxRows={20}
                />
              </StyledTextAreaWrapper>
              <StyledButtonsContainer>
                <AIChatContextUsageButton />
                <IconButton
                  Icon={IconHistory}
                  variant="tertiary"
                  size="small"
                  onClick={() =>
                    navigateCommandMenu({
                      page: CommandMenuPages.ViewPreviousAIChats,
                      pageTitle: t`View Previous AI Chats`,
                      pageIcon: IconHistory,
                    })
                  }
                  ariaLabel={t`View Previous AI Chats`}
                />
                <AgentChatFileUploadButton />
                <SendMessageButton />
              </StyledButtonsContainer>
            </StyledInputBox>
          </StyledInputArea>
        </>
      )}
    </StyledContainer>
  );
};
