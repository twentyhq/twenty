import { AiChatCompactionIndicator } from '@/ai/components/AiChatCompactionIndicator';
import { AiChatInitialLoadingIndicator } from '@/ai/components/AiChatInitialLoadingIndicator';
import { CodeExecutionDisplay } from '@/ai/components/CodeExecutionDisplay';
import { ThinkingStepsDisplay } from '@/ai/components/ThinkingStepsDisplay';

import { AiChatToolWidget } from '@/ai/components/AiChatToolWidget';
import { ThinkingToolStepRow } from '@/ai/components/ThinkingToolStepRow';
import { PAUSING_TOOL_STATUS_RENDERERS } from '@/ai/constants/PausingToolStatusRenderers';
import { LazyMarkdownContent } from '@/ai/components/LazyMarkdownRenderer';
import { useFrontComponentIdByToolName } from '@/ai/hooks/useFrontComponentIdByToolName';
import { buildFrontComponentToolCall } from '@/ai/utils/buildFrontComponentToolCall';
import { getEffectiveToolName } from '@/ai/utils/getEffectiveToolName';
import { isThinkingStepPartActive } from '@/ai/utils/isThinkingStepPartActive';
import { shouldToolPartRenderStandalone } from '@/ai/utils/shouldToolPartRenderStandalone';
import { groupContiguousThinkingStepParts } from '@/ai/utils/groupContiguousThinkingStepParts';
import { isEmptyReasoningPart } from '@/ai/utils/isEmptyReasoningPart';
import { isHiddenCompleteWorkspaceSetupToolPart } from '@/ai/utils/isHiddenCompleteWorkspaceSetupToolPart';
import { styled } from '@linaria/react';
import { getToolName, isToolUIPart } from 'ai';
import {
  type ExtendedUIMessagePart,
  isSucceededCompleteWorkspaceSetupToolPart,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledMessagePartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const MessagePartRenderer = ({
  part,
  frontComponentIdByToolName,
  isStreaming,
}: {
  part: ExtendedUIMessagePart;
  frontComponentIdByToolName: Map<string, string>;
  isStreaming: boolean;
}) => {
  switch (part.type) {
    case 'text':
      return <LazyMarkdownContent text={part.text} />;
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
        const PausingToolStatusRenderer = PAUSING_TOOL_STATUS_RENDERERS.get(
          getToolName(part),
        );

        if (isDefined(PausingToolStatusRenderer)) {
          return (
            <PausingToolStatusRenderer
              toolPart={part}
              isStreaming={isStreaming}
            />
          );
        }

        const frontComponentId = frontComponentIdByToolName.get(
          getEffectiveToolName(part),
        );

        return isDefined(frontComponentId) ? (
          <AiChatToolWidget
            toolCall={buildFrontComponentToolCall(part)}
            frontComponentId={frontComponentId}
            unavailableFallback={
              <ThinkingToolStepRow
                part={part}
                isActive={isThinkingStepPartActive(part, isStreaming)}
              />
            }
          />
        ) : null;
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
  const frontComponentIdByToolName = useFrontComponentIdByToolName();

  const hasCodeExecutionData = messageParts.some(
    (part) => part.type === 'data-code-execution',
  );
  const hasSucceededCompleteWorkspaceSetupToolPart = messageParts.some(
    isSucceededCompleteWorkspaceSetupToolPart,
  );
  const filteredParts = messageParts.filter(
    (part) =>
      part.type !== 'data-thread-title' &&
      !isEmptyReasoningPart(part) &&
      !isHiddenCompleteWorkspaceSetupToolPart(part) &&
      !(
        hasCodeExecutionData &&
        isToolUIPart(part) &&
        getEffectiveToolName(part) === 'code_interpreter'
      ),
  );
  const renderItems = groupContiguousThinkingStepParts(
    filteredParts,
    (part) =>
      isToolUIPart(part) &&
      shouldToolPartRenderStandalone(
        part,
        frontComponentIdByToolName.get(getEffectiveToolName(part)),
      ),
  );

  const lastRenderItemIndex = renderItems.length - 1;

  if (!renderItems.length && !hasError) {
    const hasOnlyHiddenReasoning =
      !isLastMessageStreaming && messageParts.some(isEmptyReasoningPart);

    return hasSucceededCompleteWorkspaceSetupToolPart ||
      hasOnlyHiddenReasoning ? null : (
      <AiChatInitialLoadingIndicator />
    );
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
              isTrailingWhileStreaming={
                isLastMessageStreaming &&
                !hasError &&
                index === lastRenderItemIndex
              }
            />
          ) : (
            <MessagePartRenderer
              key={index}
              part={renderItem.part}
              frontComponentIdByToolName={frontComponentIdByToolName}
              isStreaming={isLastMessageStreaming}
            />
          ),
        )}
      </StyledMessagePartsContainer>
    </div>
  );
};
