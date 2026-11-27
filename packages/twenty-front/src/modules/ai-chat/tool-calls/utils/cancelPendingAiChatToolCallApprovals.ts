import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { buildSkippedToolCallOutput } from '@/ai-chat/tool-calls/utils/buildSkippedToolCallOutput';
import { getPendingAiChatToolCallApprovals } from '@/ai-chat/tool-calls/utils/getPendingAiChatToolCallApprovals';
import { updateToolPartOutput } from '@/ai-chat/tool-calls/utils/updateToolPartOutput';

export const cancelPendingAiChatToolCallApprovals = ({
  messages,
  toolCallIds,
}: {
  messages: ExtendedUIMessage[];
  toolCallIds: string[];
}): ExtendedUIMessage[] =>
  getPendingAiChatToolCallApprovals(messages)
    .filter(({ toolCallId }) => toolCallIds.includes(toolCallId))
    .reduce(
      (updatedMessages, { toolCallId, proposal }) =>
        updateToolPartOutput({
          messages: updatedMessages,
          toolCallId,
          output: buildSkippedToolCallOutput({ proposal }),
        }),
      messages,
    );
