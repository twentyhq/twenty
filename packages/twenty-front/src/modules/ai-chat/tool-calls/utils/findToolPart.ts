import { type DynamicToolUIPart, isToolUIPart, type ToolUIPart } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const findToolPart = ({
  messages,
  toolCallId,
}: {
  messages: ExtendedUIMessage[];
  toolCallId: string;
}): ToolUIPart | DynamicToolUIPart | undefined => {
  for (const message of messages) {
    for (const part of message.parts) {
      if (isToolUIPart(part) && part.toolCallId === toolCallId) {
        return part;
      }
    }
  }

  return undefined;
};
