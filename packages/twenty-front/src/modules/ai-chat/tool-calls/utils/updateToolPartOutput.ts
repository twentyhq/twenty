import { isToolUIPart } from 'ai';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

export const updateToolPartOutput = ({
  messages,
  toolCallId,
  output,
}: {
  messages: ExtendedUIMessage[];
  toolCallId: string;
  output: unknown;
}): ExtendedUIMessage[] =>
  messages.map((message) =>
    message.parts.some(
      (part) => isToolUIPart(part) && part.toolCallId === toolCallId,
    )
      ? {
          ...message,
          parts: message.parts.map((part) =>
            isToolUIPart(part) && part.toolCallId === toolCallId
              ? ({ ...part, output } as ExtendedUIMessagePart)
              : part,
          ),
        }
      : message,
  );
