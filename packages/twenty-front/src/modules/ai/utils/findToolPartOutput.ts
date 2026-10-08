import { isToolUIPart } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const findToolPartOutput = ({
  messages,
  toolCallId,
}: {
  messages: ExtendedUIMessage[];
  toolCallId: string;
}): unknown => {
  for (const message of messages) {
    for (const part of message.parts) {
      if (isToolUIPart(part) && part.toolCallId === toolCallId) {
        return part.output;
      }
    }
  }

  return undefined;
};
