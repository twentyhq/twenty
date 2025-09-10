import { isDefined } from 'twenty-shared/utils';

import {
  type ParsedStep,
  type ToolEvent,
  type ToolResultEvent,
} from '@/ai/types/streamTypes';

type TextBlock =
  | { type: 'reasoning'; content: string; isThinking: boolean }
  | { type: 'text'; content: string }
  | null;

export const parseStream = (streamText: string): ParsedStep[] => {
  const lines = streamText.trim().split('\n');

  const output: ParsedStep[] = [];
  let currentTextBlock: TextBlock = null;

  const flushTextBlock = () => {
    if (isDefined(currentTextBlock)) {
      output.push(currentTextBlock);
      currentTextBlock = null;
    }
  };

  for (const line of lines) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      console.error('Invalid JSON:', line);
      continue;
    }

    switch (event.type) {
      case 'tool-call':
        flushTextBlock();
        output.push({
          type: 'tool',
          events: [
            {
              type: 'tool-call',
              toolCallId: event.toolCallId,
              toolName: event.toolName,
              args: event.args,
            },
          ] as ToolEvent[],
        });
        break;

      case 'tool-result': {
        flushTextBlock();

        const toolEntry = output.find(
          (item): item is { type: 'tool'; events: ToolEvent[] } =>
            item.type === 'tool' &&
            item.events[0]?.toolCallId === event.toolCallId,
        );

        const resultEvent: ToolResultEvent = {
          type: 'tool-result',
          toolCallId: event.toolCallId,
          toolName: event.toolName,
          result: event.result,
          message: event.message,
        };

        if (isDefined(toolEntry)) {
          toolEntry.events.push(resultEvent);
        } else {
          output.push({
            type: 'tool',
            events: [resultEvent],
          });
        }
        break;
      }

      case 'reasoning':
        if (!currentTextBlock || currentTextBlock.type !== 'reasoning') {
          flushTextBlock();
          currentTextBlock = {
            type: 'reasoning',
            content: '',
            isThinking: true,
          };
        }
        currentTextBlock.content += event.textDelta || '';
        break;

      case 'text-delta':
        if (!currentTextBlock || currentTextBlock.type !== 'text') {
          flushTextBlock();
          currentTextBlock = { type: 'text', content: '' };
        }
        currentTextBlock.content += event.textDelta || '';
        break;

      case 'reasoning-signature':
        if (currentTextBlock?.type === 'reasoning') {
          currentTextBlock.isThinking = false;
        }
        break;

      case 'step-finish':
        if (currentTextBlock?.type === 'reasoning') {
          currentTextBlock.isThinking = false;
        }
        flushTextBlock();
        break;
    }
  }

  flushTextBlock();
  return output;
};
