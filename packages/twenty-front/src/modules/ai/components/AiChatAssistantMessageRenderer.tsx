import { AiChatCompactionIndicator } from '@/ai/components/AiChatCompactionIndicator';
import { AiChatInitialLoadingIndicator } from '@/ai/components/AiChatInitialLoadingIndicator';
import { CodeExecutionDisplay } from '@/ai/components/CodeExecutionDisplay';
import { ThinkingStepsDisplay } from '@/ai/components/ThinkingStepsDisplay';

import { AiChatFormStatusRenderer } from '@/ai/components/AiChatFormStatusRenderer';
import { AiChatQuestionStatusRenderer } from '@/ai/components/AiChatQuestionStatusRenderer';
import { AiChatToolCallApprovalStatusRenderer } from '@/ai/components/AiChatToolCallApprovalStatusRenderer';
import { AiChatToolWidget } from '@/ai/components/AiChatToolWidget';
import { LazyMarkdownContent } from '@/ai/components/LazyMarkdownRenderer';
import { useFrontComponentIdByToolName } from '@/ai/hooks/useFrontComponentIdByToolName';
import { getEffectiveToolName } from '@/ai/utils/getEffectiveToolName';
import { shouldToolPartRenderStandalone } from '@/ai/utils/shouldToolPartRenderStandalone';
import { groupContiguousThinkingStepParts } from '@/ai/utils/groupContiguousThinkingStepParts';
import { isEmptyReasoningPart } from '@/ai/utils/isEmptyReasoningPart';
import { isHiddenCompleteWorkspaceSetupToolPart } from '@/ai/utils/isHiddenCompleteWorkspaceSetupToolPart';
import { AiChatValidationRuleFormFillCard } from '@/validation-rules/components/AiChatValidationRuleFormFillCard';
import { getValidationRuleFormFillFromToolPart } from '@/validation-rules/utils/getValidationRuleFormFillFromToolPart';
import { styled } from '@linaria/react';
import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTION_TOOL_NAME,
  ASK_QUESTIONS_TOOL_NAME,
  type ExtendedUIMessagePart,
  isSucceededCompleteWorkspaceSetupToolPart,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
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
        if (
          getToolName(part) === ASK_QUESTION_TOOL_NAME ||
          getToolName(part) === ASK_QUESTIONS_TOOL_NAME
        ) {
          return (
            <AiChatQuestionStatusRenderer
              toolPart={part}
              isStreaming={isStreaming}
            />
          );
        }

        if (getToolName(part) === PROPOSE_TOOL_CALL_TOOL_NAME) {
          return (
            <AiChatToolCallApprovalStatusRenderer
              toolPart={part}
              isStreaming={isStreaming}
            />
          );
        }

        if (getToolName(part) === REQUEST_FORM_TOOL_NAME) {
          return (
            <AiChatFormStatusRenderer
              toolPart={part}
              isStreaming={isStreaming}
            />
          );
        }

        const validationRuleFormFill =
          getValidationRuleFormFillFromToolPart(part);

        if (isDefined(validationRuleFormFill)) {
          return (
            <AiChatValidationRuleFormFillCard
              validationRuleFormFill={validationRuleFormFill}
            />
          );
        }

        const frontComponentId = frontComponentIdByToolName.get(
          getEffectiveToolName(part),
        );

        return isDefined(frontComponentId) ? (
          <AiChatToolWidget
            toolPart={part}
            frontComponentId={frontComponentId}
            isStreaming={isStreaming}
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
  shouldHideThinkingSteps = false,
  workDurationMs,
}: {
  messageParts: ExtendedUIMessagePart[];
  isLastMessageStreaming: boolean;
  hasError?: boolean;
  shouldHideThinkingSteps?: boolean;
  workDurationMs?: number | null;
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
  const groupedRenderItems = groupContiguousThinkingStepParts(
    filteredParts,
    (part) =>
      isToolUIPart(part) &&
      (shouldToolPartRenderStandalone(
        part,
        frontComponentIdByToolName.get(getEffectiveToolName(part)),
      ) ||
        isDefined(getValidationRuleFormFillFromToolPart(part))),
  );
  const renderItemsWithoutThinkingSteps = groupedRenderItems.filter(
    (renderItem) => renderItem.type !== 'thinking-steps',
  );
  // Falling back to the steps keeps a finished message from rendering as an empty entry
  const renderItems =
    shouldHideThinkingSteps &&
    (isLastMessageStreaming || renderItemsWithoutThinkingSteps.length > 0)
      ? renderItemsWithoutThinkingSteps
      : groupedRenderItems;

  const lastRenderItemIndex = renderItems.length - 1;
  // the duration covers the whole message, so only the steps right before the final answer carry it
  const lastThinkingStepsRenderItemIndex = renderItems.findLastIndex(
    (renderItem) => renderItem.type === 'thinking-steps',
  );

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
              workDurationMs={
                index === lastThinkingStepsRenderItemIndex
                  ? workDurationMs
                  : null
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
