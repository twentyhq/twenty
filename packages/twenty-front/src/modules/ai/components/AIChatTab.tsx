import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import { IconHistory, IconMessageCirclePlus } from 'twenty-ui/display';

import { DropZone } from '@/activities/files/components/DropZone';
import { AgentChatFileUploadButton } from '@/ai/components/internal/AgentChatFileUploadButton';
import { useCreateNewAIChatThread } from '@/ai/hooks/useCreateNewAIChatThread';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { AIChatEmptyState } from '@/ai/components/AIChatEmptyState';
import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { AIChatStandaloneError } from '@/ai/components/AIChatStandaloneError';
import { AIChatContextUsageButton } from '@/ai/components/internal/AIChatContextUsageButton';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { AgentChatContextPreview } from '@/ai/components/internal/AgentChatContextPreview';
import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div<{ isDraggingFile: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  height: ${({ isDraggingFile }) =>
    isDraggingFile ? `calc(100% - 24px)` : '100%'};
  padding: ${({ isDraggingFile, theme }) =>
    isDraggingFile ? theme.spacing(3) : '0'};
  display: flex;
  flex-direction: column;
`;

const StyledInputArea = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.primary};
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
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const AIChatTab = () => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const { isLoading, messages, isStreaming, error } =
    useAgentChatContextOrThrow();

  const [agentChatInput, setAgentChatInput] =
    useRecoilState(agentChatInputState);

  const { uploadFiles } = useAIChatFileUpload();
  const { createChatThread } = useCreateNewAIChatThread();
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
          {messages.length === 0 && !error && <AIChatEmptyState />}
          {messages.length === 0 && error && !isLoading && (
            <AIChatStandaloneError error={error} />
          )}
          {isLoading && messages.length === 0 && <AIChatSkeletonLoader />}

          <StyledInputArea>
            <AgentChatContextPreview />
            <TextArea
              textAreaId={AI_CHAT_INPUT_ID}
              placeholder={t`Enter a question...`}
              value={agentChatInput}
              onChange={(value) => setAgentChatInput(value)}
              minRows={1}
              maxRows={20}
            />
            <StyledButtonsContainer>
              <Button
                variant="secondary"
                size="small"
                Icon={IconHistory}
                onClick={() =>
                  navigateCommandMenu({
                    page: CommandMenuPages.ViewPreviousAIChats,
                    pageTitle: t`View Previous AI Chats`,
                    pageIcon: IconHistory,
                  })
                }
              />
              <Button
                variant="secondary"
                size="small"
                Icon={IconMessageCirclePlus}
                onClick={() => createChatThread()}
              />
              <AgentChatFileUploadButton />
              <AIChatContextUsageButton />
              <SendMessageButton />
            </StyledButtonsContainer>
          </StyledInputArea>
        </>
      )}
    </StyledContainer>
  );
};
