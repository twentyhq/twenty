import { isToolUIPart } from 'ai';
import {
  type AskQuestionsToolResult,
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const markQuestionPending = (
  messages: ExtendedUIMessage[],
  messageId: string,
  toolCallId: string,
): ExtendedUIMessage[] =>
  messages.map((message) => {
    if (message.id !== messageId) {
      return message;
    }

    return {
      ...message,
      parts: message.parts.map((part) => {
        if (!isToolUIPart(part) || part.toolCallId !== toolCallId) {
          return part;
        }

        const previousOutput = isDefined(part.output)
          ? (part.output as Record<string, unknown>)
          : {};
        const previousResult = previousOutput.result as
          | AskQuestionsToolResult
          | undefined;

        return {
          ...part,
          output: {
            ...previousOutput,
            result: {
              questions: previousResult?.questions ?? [],
              status: 'pending',
            } satisfies AskQuestionsToolResult,
          },
        } as ExtendedUIMessagePart;
      }),
    };
  });
