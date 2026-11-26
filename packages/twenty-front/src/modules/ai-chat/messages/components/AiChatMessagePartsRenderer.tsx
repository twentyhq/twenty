import { styled } from '@linaria/react';
import { isToolUIPart } from 'ai';
import {
  type ExtendedUIMessagePart,
  isNoReplyToolPart,
  isSucceededCompleteWorkspaceSetupToolPart,
} from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInitialLoadingIndicator } from '@/ai-chat/messages/components/AiChatInitialLoadingIndicator';
import { AiChatMessagePartRenderer } from '@/ai-chat/messages/components/AiChatMessagePartRenderer';
import { type AiChatMessageRenderItem } from '@/ai-chat/messages/types/AiChatMessageRenderItem';
import { groupContiguousThinkingStepParts } from '@/ai-chat/messages/utils/groupContiguousThinkingStepParts';
import { ThinkingStepsDisplay } from '@/ai-chat/thinking-steps/components/ThinkingStepsDisplay';
import { isHiddenReasoningPart } from '@/ai-chat/thinking-steps/utils/isHiddenReasoningPart';
import { useFrontComponentIdByToolName } from '@/ai-chat/tool-calls/hooks/useFrontComponentIdByToolName';
import { getEffectiveToolName } from '@/ai-chat/tool-calls/utils/getEffectiveToolName';
import { useIsStandaloneToolPart } from '@/ai-chat/tool-calls/hooks/useIsStandaloneToolPart';
import { isHiddenCompleteWorkspaceSetupToolPart } from '@/ai-chat/workspace-setup/utils/isHiddenCompleteWorkspaceSetupToolPart';

const StyledMessagePartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const AiChatMessagePartsRenderer = ({
  messageParts,
  isLastMessageStreaming,
  isUserMessage,
  hasError,
  shouldHideThinkingSteps = false,
  workDurationMs,
}: {
  messageParts: ExtendedUIMessagePart[];
  isLastMessageStreaming: boolean;
  isUserMessage?: boolean;
  hasError?: boolean;
  shouldHideThinkingSteps?: boolean;
  workDurationMs?: number | null;
}) => {
  const frontComponentIdByToolName = useFrontComponentIdByToolName();
  const isStandaloneToolPart = useIsStandaloneToolPart();

  const hasCodeExecutionData = messageParts.some(
    (part) => part.type === 'data-code-execution',
  );
  const hasSucceededCompleteWorkspaceSetupToolPart = messageParts.some(
    isSucceededCompleteWorkspaceSetupToolPart,
  );
  const filteredParts = messageParts.filter(
    (part) =>
      part.type !== 'data-thread-title' &&
      !isHiddenReasoningPart(part) &&
      !isHiddenCompleteWorkspaceSetupToolPart(part) &&
      !isNoReplyToolPart(part) &&
      !(
        hasCodeExecutionData &&
        isToolUIPart(part) &&
        getEffectiveToolName(part) === 'code_interpreter'
      ),
  );
  const groupedRenderItems = groupContiguousThinkingStepParts(
    filteredParts,
    isStandaloneToolPart,
  );
  const renderItemsWithoutThinkingSteps = groupedRenderItems.filter(
    (renderItem) => renderItem.type !== 'thinking-steps',
  );
  const visibleRenderItems =
    shouldHideThinkingSteps &&
    (isLastMessageStreaming || renderItemsWithoutThinkingSteps.length > 0)
      ? renderItemsWithoutThinkingSteps
      : groupedRenderItems;
  const isAwaitingFirstStep =
    visibleRenderItems.length === 0 &&
    isLastMessageStreaming &&
    !hasError &&
    !shouldHideThinkingSteps &&
    !hasSucceededCompleteWorkspaceSetupToolPart;
  const renderItems: AiChatMessageRenderItem[] = isAwaitingFirstStep
    ? [{ type: 'thinking-steps', parts: [] }]
    : visibleRenderItems;

  const lastRenderItemIndex = renderItems.length - 1;
  const lastThinkingStepsRenderItemIndex = renderItems.findLastIndex(
    (renderItem) => renderItem.type === 'thinking-steps',
  );

  if (!renderItems.length && !hasError) {
    const hasOnlyHiddenReasoning =
      !isLastMessageStreaming && messageParts.some(isHiddenReasoningPart);

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
              isTrailingWhileStreaming={
                isLastMessageStreaming &&
                !hasError &&
                index === lastRenderItemIndex
              }
              workDurationMs={
                index === lastThinkingStepsRenderItemIndex
                  ? workDurationMs
                  : null
              }
            />
          ) : (
            <AiChatMessagePartRenderer
              key={index}
              part={renderItem.part}
              frontComponentIdByToolName={frontComponentIdByToolName}
              isStreaming={isLastMessageStreaming}
              isUserMessage={isUserMessage}
            />
          ),
        )}
      </StyledMessagePartsContainer>
    </div>
  );
};
