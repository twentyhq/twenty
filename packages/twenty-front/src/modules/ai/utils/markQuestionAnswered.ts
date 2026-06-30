import { isToolUIPart } from 'ai';
import {
  type AskQuestionAnswer,
  type AskQuestionsToolResult,
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

export const markQuestionAnswered = (
  messages: ExtendedUIMessage[],
  messageId: string,
  toolCallId: string,
  answers: AskQuestionAnswer[],
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

        const previousOutput =
          typeof part.output === 'object' && part.output !== null
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
              status: 'answered',
              answers,
            } satisfies AskQuestionsToolResult,
          },
        } as ExtendedUIMessagePart;
      }),
    };
  });
