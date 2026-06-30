import { isToolUIPart } from 'ai';
import {
  type AskQuestionAnswer,
  type AskQuestionsToolResult,
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

// Optimistically flips an `ask_questions` tool part to 'answered' so the
// question card hides immediately, before the server round-trip resolves.
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

        // The ask_questions part is always `output-available`; cast keeps the
        // ai-sdk state-discriminated ToolUIPart union happy when spreading.
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
