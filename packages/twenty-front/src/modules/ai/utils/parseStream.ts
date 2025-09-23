import {
  parseStreamLine,
  splitStreamIntoLines,
  type ErrorEvent,
  type ReasoningDeltaEvent,
  type TextBlock,
  type TextDeltaEvent,
  type ToolCallEvent,
  type ToolEvent,
  type ToolResultEvent,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import type { ParsedStep } from '@/ai/types/ParsedStep';

const handleToolCall = (
  event: ToolCallEvent,
  output: ParsedStep[],
  flushTextBlock: () => void,
) => {
  flushTextBlock();
  output.push({
    type: 'tool',
    events: [event],
  });
};

const handleToolResult = (
  event: ToolResultEvent,
  output: ParsedStep[],
  flushTextBlock: () => void,
) => {
  flushTextBlock();

  const toolEntry = output.find(
    (item): item is { type: 'tool'; events: ToolEvent[] } =>
      item.type === 'tool' &&
      item.events.some(
        (e) => e.type === 'tool-call' && e.toolCallId === event.toolCallId,
      ),
  );

  if (isDefined(toolEntry)) {
    toolEntry.events.push(event);
  } else {
    output.push({
      type: 'tool',
      events: [event],
    });
  }
};

const handleReasoningStart = (flushTextBlock: () => void): TextBlock => {
  flushTextBlock();
  return {
    type: 'reasoning',
    content: '',
    isThinking: true,
  };
};

const handleReasoningDelta = (
  event: ReasoningDeltaEvent,
  currentTextBlock: TextBlock,
  flushTextBlock: () => void,
): TextBlock => {
  if (!currentTextBlock || currentTextBlock.type !== 'reasoning') {
    flushTextBlock();
    return {
      type: 'reasoning',
      content: event.text || '',
      isThinking: true,
    };
  }
  currentTextBlock.content += event.text || '';
  return currentTextBlock;
};

const handleReasoningEnd = (currentTextBlock: TextBlock): TextBlock => {
  if (currentTextBlock?.type === 'reasoning') {
    return {
      ...currentTextBlock,
      isThinking: false,
    };
  }
  return currentTextBlock;
};

const handleTextDelta = (
  event: TextDeltaEvent,
  currentTextBlock: TextBlock,
  flushTextBlock: () => void,
): TextBlock => {
  if (!currentTextBlock || currentTextBlock.type !== 'text') {
    flushTextBlock();
    return { type: 'text', content: event.text || '' };
  }
  currentTextBlock.content += event.text || '';
  return currentTextBlock;
};

const handleStepFinish = (
  currentTextBlock: TextBlock,
  flushTextBlock: () => void,
): TextBlock => {
  if (currentTextBlock?.type === 'reasoning') {
    currentTextBlock.isThinking = false;
  }
  flushTextBlock();
  return null;
};

const handleError = (
  event: ErrorEvent,
  output: ParsedStep[],
  flushTextBlock: () => void,
) => {
  flushTextBlock();
  output.push({
    type: 'error',
    message: event.message || 'An error occurred',
    error: event.error,
  });
};

export const parseStream = (streamText: string): ParsedStep[] => {
  const lines = splitStreamIntoLines(streamText);
  const output: ParsedStep[] = [];
  let currentTextBlock: TextBlock = null;

  const flushTextBlock = () => {
    if (isDefined(currentTextBlock)) {
      output.push(currentTextBlock);
      currentTextBlock = null;
    }
  };

  for (const line of lines) {
    const event = parseStreamLine(line);
    if (!event) {
      continue;
    }

    switch (event.type) {
      case 'tool-call':
        handleToolCall(event, output, flushTextBlock);
        break;

      case 'tool-result':
        handleToolResult(event, output, flushTextBlock);
        break;

      case 'reasoning-start':
        currentTextBlock = handleReasoningStart(flushTextBlock);
        break;

      case 'reasoning-delta':
        currentTextBlock = handleReasoningDelta(
          event,
          currentTextBlock,
          flushTextBlock,
        );
        break;

      case 'reasoning-end':
        currentTextBlock = handleReasoningEnd(currentTextBlock);
        break;

      case 'text-delta':
        currentTextBlock = handleTextDelta(
          event,
          currentTextBlock,
          flushTextBlock,
        );
        break;

      case 'step-finish':
        currentTextBlock = handleStepFinish(currentTextBlock, flushTextBlock);
        break;

      case 'error':
        handleError(event, output, flushTextBlock);
        break;
    }
  }

  flushTextBlock();
  return output;
};
