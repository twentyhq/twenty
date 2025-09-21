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

type ParseContext = {
  output: ParsedStep[];
  currentTextBlock: TextBlock;
  flushTextBlock: () => void;
};

const handleToolCall = (event: ToolCallEvent, context: ParseContext) => {
  context.flushTextBlock();
  context.output.push({
    type: 'tool',
    events: [event],
  });
};

const handleToolResult = (event: ToolResultEvent, context: ParseContext) => {
  context.flushTextBlock();

  const toolEntry = context.output.find(
    (item): item is { type: 'tool'; events: ToolEvent[] } =>
      item.type === 'tool' &&
      item.events.some(
        (e) => e.type === 'tool-call' && e.toolCallId === event.toolCallId,
      ),
  );

  if (isDefined(toolEntry)) {
    toolEntry.events.push(event);
  } else {
    context.output.push({
      type: 'tool',
      events: [event],
    });
  }
};

const handleReasoningStart = (context: ParseContext) => {
  context.flushTextBlock();
  context.currentTextBlock = {
    type: 'reasoning',
    content: '',
    isThinking: true,
  };
};

const handleReasoningDelta = (
  event: ReasoningDeltaEvent,
  context: ParseContext,
) => {
  if (
    !context.currentTextBlock ||
    context.currentTextBlock.type !== 'reasoning'
  ) {
    context.flushTextBlock();
    context.currentTextBlock = {
      type: 'reasoning',
      content: '',
      isThinking: true,
    };
  }
  context.currentTextBlock.content += event.text || '';
};

const handleReasoningEnd = (context: ParseContext) => {
  if (context.currentTextBlock?.type === 'reasoning') {
    context.currentTextBlock.isThinking = false;
  }
};

const handleTextDelta = (event: TextDeltaEvent, context: ParseContext) => {
  if (!context.currentTextBlock || context.currentTextBlock.type !== 'text') {
    context.flushTextBlock();
    context.currentTextBlock = { type: 'text', content: '' };
  }
  context.currentTextBlock.content += event.text || '';
};

const handleStepFinish = (context: ParseContext) => {
  if (context.currentTextBlock?.type === 'reasoning') {
    context.currentTextBlock.isThinking = false;
  }
  context.flushTextBlock();
};

const handleError = (event: ErrorEvent, context: ParseContext) => {
  context.flushTextBlock();
  context.output.push({
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

  const context: ParseContext = {
    output,
    currentTextBlock,
    flushTextBlock,
  };

  for (const line of lines) {
    const event = parseStreamLine(line);
    if (!event) {
      continue;
    }

    context.currentTextBlock = currentTextBlock;

    switch (event.type) {
      case 'tool-call':
        handleToolCall(event, context);
        break;

      case 'tool-result':
        handleToolResult(event, context);
        break;

      case 'reasoning-start':
        handleReasoningStart(context);
        break;

      case 'reasoning-delta':
        handleReasoningDelta(event, context);
        break;

      case 'reasoning-end':
        handleReasoningEnd(context);
        break;

      case 'text-delta':
        handleTextDelta(event, context);
        break;

      case 'step-finish':
        handleStepFinish(context);
        break;

      case 'error':
        handleError(event, context);
        break;
    }

    currentTextBlock = context.currentTextBlock;
  }

  flushTextBlock();
  return output;
};
