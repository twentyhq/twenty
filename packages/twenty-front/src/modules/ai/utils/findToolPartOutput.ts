import { isToolUIPart } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const findToolPartOutput = ({
  messages,
  toolCallId,
}: {
  messages: ExtendedUIMessage[];
  toolCallId: string;
}): unknown =>
  messages
    .flatMap((message) => message.parts)
    .find((part) => isToolUIPart(part) && part.toolCallId === toolCallId)
    ?.output;
