import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatPendingToolCall } from '@/ai-chat/tool-calls/types/AiChatPendingToolCall';
import { parsePendingToolCall } from '@/ai-chat/tool-calls/utils/parsePendingToolCall';

type AiChatPendingToolCallApproval = Extract<
  AiChatPendingToolCall,
  { kind: 'toolCallApproval' }
>;

const isPendingToolCallApproval = (
  pendingToolCall: AiChatPendingToolCall,
): pendingToolCall is AiChatPendingToolCallApproval =>
  pendingToolCall.kind === 'toolCallApproval';

export const getPendingAiChatToolCallApprovals = (
  messages: ExtendedUIMessage[],
): AiChatPendingToolCallApproval[] =>
  messages
    .flatMap((message) => message.parts.map(parsePendingToolCall))
    .filter(isDefined)
    .filter(isPendingToolCallApproval);
