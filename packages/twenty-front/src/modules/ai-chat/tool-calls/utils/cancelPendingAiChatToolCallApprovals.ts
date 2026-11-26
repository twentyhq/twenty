import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatPendingToolCall } from '@/ai-chat/tool-calls/types/AiChatPendingToolCall';
import { buildSkippedToolCallOutput } from '@/ai-chat/tool-calls/utils/buildSkippedToolCallOutput';
import { parsePendingToolCall } from '@/ai-chat/tool-calls/utils/parsePendingToolCall';
import { updateToolPartOutput } from '@/ai-chat/tool-calls/utils/updateToolPartOutput';

const isPendingToolCallApproval = (
  pendingToolCall: AiChatPendingToolCall,
): pendingToolCall is Extract<
  AiChatPendingToolCall,
  { kind: 'toolCallApproval' }
> => pendingToolCall.kind === 'toolCallApproval';

export const cancelPendingAiChatToolCallApprovals = (
  messages: ExtendedUIMessage[],
): ExtendedUIMessage[] =>
  messages
    .flatMap((message) => message.parts.map(parsePendingToolCall))
    .filter(isDefined)
    .filter(isPendingToolCallApproval)
    .reduce(
      (updatedMessages, { toolCallId, proposal }) =>
        updateToolPartOutput({
          messages: updatedMessages,
          toolCallId,
          output: buildSkippedToolCallOutput({ proposal }),
        }),
      messages,
    );
