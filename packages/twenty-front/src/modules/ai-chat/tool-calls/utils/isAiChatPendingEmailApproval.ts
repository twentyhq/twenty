import { type AiChatPendingEmailApproval } from '@/ai-chat/tool-calls/types/AiChatPendingEmailApproval';
import { type AiChatPendingToolCall } from '@/ai-chat/tool-calls/types/AiChatPendingToolCall';

export const isAiChatPendingEmailApproval = (
  pendingToolCall: AiChatPendingToolCall,
): pendingToolCall is AiChatPendingToolCall & AiChatPendingEmailApproval =>
  pendingToolCall.kind === 'toolCallApproval' &&
  pendingToolCall.proposal.template === 'email';
