import { CodeExecutionDisplay } from '@/ai/components/CodeExecutionDisplay';
import { RoutingStatusDisplay } from '@/ai/components/RoutingStatusDisplay';
import { ThinkingStepsDisplay } from '@/ai/components/ThinkingStepsDisplay';
import { IconDotsVertical } from 'twenty-ui/display';

import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import { groupContiguousThinkingStepParts } from '@/ai/utils/groupContiguousThinkingStepParts';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

const StyledMessagePartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLoadingIconContainer = styled.div`
  align-items: center;
  border: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: center;
  padding-inline: ${({ theme }) => theme.spacing(1)};
`;

const StyledLoadingIcon = styled(IconDotsVertical)`
  color: ${({ theme }) => theme.font.color.light};
  transform: rotate(90deg);
`;

const InitialLoadingIndicator = () => {
  const theme = useTheme();

  return (
    <StyledLoadingIconContainer>
      <StyledLoadingIcon size={theme.icon.size.xl} />
    </StyledLoadingIconContainer>
  );
};

const MessagePartRenderer = ({
  part,
  isStreaming,
}: {
  part: ExtendedUIMessagePart;
  isStreaming: boolean;
}) => {
  switch (part.type) {
    case 'text':
      return <LazyMarkdownRenderer text={part.text} />;
    case 'data-routing-status':
      return <RoutingStatusDisplay data={part.data} />;
    case 'data-code-execution':
      return (
        <CodeExecutionDisplay
          code={part.data.code}
          stdout={part.data.stdout}
          stderr={part.data.stderr}
          exitCode={part.data.exitCode}
          files={part.data.files}
          isRunning={
            part.data.state === 'running' || part.data.state === 'pending'
          }
        />
      );
    default:
      if (isToolUIPart(part)) {
        return <ToolStepRenderer toolPart={part} isStreaming={isStreaming} />;
      }
      return null;
  }
};

export const AIChatAssistantMessageRenderer = ({
  messageParts,
  isLastMessageStreaming,
  hasError,
}: {
  messageParts: ExtendedUIMessagePart[];
  isLastMessageStreaming: boolean;
  hasError?: boolean;
}) => {
  // Filter out data-code-execution parts when tool-code_interpreter exists
  // (the tool part contains the final result, data-code-execution is for streaming updates)
  // Also filter out data-thread-title (consumed by useAgentChat, not rendered)
  const hasCodeInterpreterTool = messageParts.some(
    (part) => part.type === 'tool-code_interpreter',
  );
  const filteredParts = messageParts.filter(
    (part) =>
      part.type !== 'data-thread-title' &&
      (!hasCodeInterpreterTool || part.type !== 'data-code-execution'),
  );
  const renderItems = groupContiguousThinkingStepParts(filteredParts);

  if (!renderItems.length && !hasError) {
    return <InitialLoadingIndicator />;
  }

  return (
    <div>
      <StyledMessagePartsContainer>
        {renderItems.map((renderItem, index) =>
          renderItem.type === 'thinking-steps' ? (
            <ThinkingStepsDisplay
              key={index}
              parts={renderItem.parts}
              isLastMessageStreaming={isLastMessageStreaming}
              hasAssistantTextResponseStarted={renderItems
                .slice(index + 1)
                .some(
                  (nextRenderItem) =>
                    nextRenderItem.type === 'part' &&
                    nextRenderItem.part.type === 'text' &&
                    nextRenderItem.part.text.trim().length > 0,
                )}
            />
          ) : (
            <MessagePartRenderer
              key={index}
              part={renderItem.part}
              isStreaming={isLastMessageStreaming}
            />
          ),
        )}
      </StyledMessagePartsContainer>
    </div>
  );
};
