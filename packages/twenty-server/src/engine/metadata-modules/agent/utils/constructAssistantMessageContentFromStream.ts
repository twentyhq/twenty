import { type TextPart } from 'ai';

type ReasoningPart = {
  type: 'reasoning';
  text: string;
  isThinking: boolean;
};

type TextBlock =
  | { type: 'reasoning'; content: string; isThinking: boolean }
  | { type: 'text'; content: string }
  | null;

export const constructAssistantMessageContentFromStream = (
  rawContent: string,
) => {
  const lines = rawContent.trim().split('\n');

  const output: Array<TextPart | ReasoningPart> = [];
  let currentTextBlock: TextBlock = null;

  const flushTextBlock = () => {
    if (currentTextBlock) {
      if (currentTextBlock.type === 'reasoning') {
        output.push({
          type: 'reasoning',
          text: currentTextBlock.content,
          isThinking: currentTextBlock.isThinking,
        });
      } else {
        output.push({
          type: 'text',
          text: currentTextBlock.content,
        });
      }
      currentTextBlock = null;
    }
  };

  for (const line of lines) {
    let event;

    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }

    switch (event.type) {
      case 'reasoning-start':
        flushTextBlock();
        currentTextBlock = {
          type: 'reasoning',
          content: '',
          isThinking: true,
        };
        break;

      case 'reasoning-delta':
        if (!currentTextBlock || currentTextBlock.type !== 'reasoning') {
          flushTextBlock();
          currentTextBlock = {
            type: 'reasoning',
            content: '',
            isThinking: true,
          };
        }
        currentTextBlock.content += event.text || '';
        break;

      case 'reasoning-end':
        if (currentTextBlock?.type === 'reasoning') {
          currentTextBlock.isThinking = false;
        }
        break;

      case 'text-delta':
        if (!currentTextBlock || currentTextBlock.type !== 'text') {
          flushTextBlock();
          currentTextBlock = { type: 'text', content: '' };
        }
        currentTextBlock.content += event.text || '';
        break;

      case 'step-finish':
        if (currentTextBlock?.type === 'reasoning') {
          currentTextBlock.isThinking = false;
        }
        flushTextBlock();
        break;

      case 'error':
        flushTextBlock();
        break;

      default:
        break;
    }
  }

  flushTextBlock();

  return output;
};
