import { AiChatCompactionIndicator } from '@/ai/components/AiChatCompactionIndicator';
import { AiChatInitialLoadingIndicator } from '@/ai/components/AiChatInitialLoadingIndicator';
import { CodeExecutionDisplay } from '@/ai/components/CodeExecutionDisplay';
import { RoutingStatusDisplay } from '@/ai/components/RoutingStatusDisplay';
import { ThinkingStepsDisplay } from '@/ai/components/ThinkingStepsDisplay';

import { AiChatQuestionStatusRenderer } from '@/ai/components/AiChatQuestionStatusRenderer';
import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { ToolStepRenderer } from '@/ai/components/ToolStepRenderer';
import { groupContiguousThinkingStepParts } from '@/ai/utils/groupContiguousThinkingStepParts';
import { isCodeInterpreterToolPart } from '@/ai/utils/isCodeInterpreterToolPart';
import { styled } from '@linaria/react';
import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledMessagePartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

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
    case 'data-compaction':
      return <AiChatCompactionIndicator />;
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
        if (getToolName(part) === ASK_QUESTIONS_TOOL_NAME) {
          return (
            <AiChatQuestionStatusRenderer
              toolPart={part}
              isStreaming={isStreaming}
            />
          );
        }

        return <ToolStepRenderer toolPart={part} isStreaming={isStreaming} />;
      }
      return null;
  }
};

export const AiChatAssistantMessageRenderer = ({
  messageParts,
  isLastMessageStreaming,
  hasError,
}: {
  messageParts: ExtendedUIMessagePart[];
  isLastMessageStreaming: boolean;
  hasError?: boolean;
}) => {
  const hasCodeExecutionData = messageParts.some(
    (part) => part.type === 'data-code-execution',
  );
  const filteredParts = messageParts.filter(
    (part) =>
      part.type !== 'data-thread-title' &&
      !(hasCodeExecutionData && isCodeInterpreterToolPart(part)),
  );
  const renderItems = groupContiguousThinkingStepParts(filteredParts);

  if (!renderItems.length && !hasError) {
    return <AiChatInitialLoadingIndicator />;
  }

  return (
    <div>
      <StyledMessagePartsContainer data-replay-ignore-mutations="true">
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
