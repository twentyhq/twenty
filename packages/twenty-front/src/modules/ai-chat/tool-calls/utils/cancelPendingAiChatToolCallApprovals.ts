import { isToolUIPart } from 'ai';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  type ProposeToolCallToolStatus,
} from 'twenty-shared/ai';
import { isPlainObject } from 'twenty-shared/utils';

import { parsePendingToolCall } from '@/ai-chat/tool-calls/utils/parsePendingToolCall';

const isPendingToolCallApproval = (part: ExtendedUIMessagePart) =>
  parsePendingToolCall(part)?.kind === 'toolCallApproval';

const cancelPendingToolCallApproval = (
  part: ExtendedUIMessagePart,
): ExtendedUIMessagePart =>
  isToolUIPart(part) &&
  isPlainObject(part.output) &&
  isPlainObject(part.output.result) &&
  isPendingToolCallApproval(part)
    ? ({
        ...part,
        output: {
          ...part.output,
          result: {
            ...part.output.result,
            status: 'skipped' satisfies ProposeToolCallToolStatus,
          },
        },
      } as ExtendedUIMessagePart)
    : part;

export const cancelPendingAiChatToolCallApprovals = (
  messages: ExtendedUIMessage[],
): ExtendedUIMessage[] =>
  messages.map((message) =>
    message.parts.some(isPendingToolCallApproval)
      ? { ...message, parts: message.parts.map(cancelPendingToolCallApproval) }
      : message,
  );
