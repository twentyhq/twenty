import { type TextPart } from 'ai';

type ReasoningPart = {
  type: 'reasoning';
  text: string;
  signature: string;
};

export const constructAssistantMessageContentFromStream = (
  streamData: string,
) => {
  const lines = streamData.trim().split('\n');

  const output: Array<TextPart | ReasoningPart> = [];
  let reasoningText = '';
  let textContent = '';

  for (const line of lines) {
    let event;

    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }

    switch (event.type) {
      case 'reasoning':
        reasoningText += event.textDelta || '';
        break;

      case 'reasoning-signature':
        if (reasoningText) {
          output.push({
            type: 'reasoning',
            text: reasoningText,
            signature: event.signature,
          });
          reasoningText = '';
        }
        break;

      case 'text-delta':
        textContent += event.textDelta || '';
        break;

      default:
        if (textContent) {
          output.push({
            type: 'text',
            text: textContent,
          });
          textContent = '';
        }
        break;
    }
  }

  return output;
};
