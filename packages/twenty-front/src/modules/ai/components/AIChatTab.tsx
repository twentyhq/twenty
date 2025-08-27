import { TextArea } from '@/ui/input/components/TextArea';
import styled from '@emotion/styled';
import { IconHistory, IconMessageCirclePlus } from 'twenty-ui/display';

import { DropZone } from '@/activities/files/components/DropZone';
import { AgentChatFileUploadButton } from '@/ai/components/internal/AgentChatFileUploadButton';
import { useCreateNewAIChatThread } from '@/ai/hooks/useCreateNewAIChatThread';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { AIChatEmptyState } from '@/ai/components/AIChatEmptyState';
import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { AgentChatContextPreview } from '@/ai/components/internal/AgentChatContextPreview';
import { SendMessageButton } from '@/ai/components/internal/SendMessageButton';
import { SendMessageWithRecordsContextButton } from '@/ai/components/internal/SendMessageWithRecordsContextButton';
import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { useAgentChat } from '../hooks/useAgentChat';

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

export const AIChatTab = ({
  agentId,
  isWorkflowAgentNodeChat,
}: {
  agentId: string;
  isWorkflowAgentNodeChat?: boolean;
}) => {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const {
    messages,
    isLoading,
    input,
    handleInputChange,
    agentStreamingMessage,
    scrollWrapperId,
  } = useAgentChat(agentId);
  const { uploadFiles } = useAIChatFileUpload({ agentId });

  const { createAgentChatThread } = useCreateNewAIChatThread({ agentId });
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
            <StyledScrollWrapper componentInstanceId={scrollWrapperId}>
              {messages.map((message) => (
                <AIChatMessage
                  agentStreamingMessage={agentStreamingMessage}
                  message={message}
                  key={message.id}
                />
              ))}
            </StyledScrollWrapper>
          )}
          {messages.length === 0 && !isLoading && <AIChatEmptyState />}
          {isLoading && messages.length === 0 && <AIChatSkeletonLoader />}

          <StyledInputArea>
            <AgentChatContextPreview agentId={agentId} />
            <TextArea
              textAreaId={`${agentId}-chat-input`}
              placeholder={t`Enter a question...`}
              value={input}
              onChange={handleInputChange}
            />
            <StyledButtonsContainer>
              {!isWorkflowAgentNodeChat && (
                <>
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
                    onClick={() => createAgentChatThread()}
                  />
                </>
              )}
              <AgentChatFileUploadButton agentId={agentId} />
              {contextStoreCurrentObjectMetadataItemId ? (
                <SendMessageWithRecordsContextButton agentId={agentId} />
              ) : (
                <SendMessageButton agentId={agentId} />
              )}
            </StyledButtonsContainer>
          </StyledInputArea>
        </>
      )}
    </StyledContainer>
  );
};
