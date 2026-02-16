import { isToolUIPart, type ReasoningUIPart, type ToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export type ThinkingStepPart = ReasoningUIPart | ToolUIPart;

export type AssistantMessageRenderItem =
  | {
      type: 'thinking-steps';
      parts: ThinkingStepPart[];
    }
  | {
      type: 'part';
      part: ExtendedUIMessagePart;
    };

export const isThinkingStepPart = (
  part: ExtendedUIMessagePart,
): part is ThinkingStepPart => {
  if (part.type === 'reasoning') {
    return true;
  }

  return isToolUIPart(part) && part.type !== 'tool-code_interpreter';
};

export const isThinkingStepPartActive = (
  part: ThinkingStepPart,
  isLastMessageStreaming: boolean,
): boolean => {
  if (part.type === 'reasoning') {
    return part.state === 'streaming';
  }

  return (
    isLastMessageStreaming &&
    !isDefined(part.output) &&
    !isDefined(part.errorText)
  );
};

export const groupContiguousThinkingStepParts = (
  parts: ExtendedUIMessagePart[],
): AssistantMessageRenderItem[] => {
  const renderItems: AssistantMessageRenderItem[] = [];
  let currentThinkingParts: ThinkingStepPart[] = [];

  const flushThinkingParts = () => {
    if (currentThinkingParts.length > 0) {
      renderItems.push({
        type: 'thinking-steps',
        parts: currentThinkingParts,
      });
      currentThinkingParts = [];
    }
  };

  for (const part of parts) {
    if (part.type === 'step-start') {
      continue;
    }

    if (isThinkingStepPart(part)) {
      currentThinkingParts.push(part);
      continue;
    }

    flushThinkingParts();

    renderItems.push({
      type: 'part',
      part,
    });
  }

  flushThinkingParts();

  return renderItems;
};

export const getActiveReasoningContent = (
  parts: ThinkingStepPart[],
): string | null => {
  const activeReasoningPart = parts.find(
    (part): part is ReasoningUIPart =>
      part.type === 'reasoning' && part.state === 'streaming',
  );

  return activeReasoningPart?.text ?? null;
};

export const getLastReasoningContent = (
  parts: ThinkingStepPart[],
): string | null => {
  const reasoningParts = parts.filter(
    (part): part is ReasoningUIPart => part.type === 'reasoning',
  );

  return reasoningParts.at(-1)?.text ?? null;
};
