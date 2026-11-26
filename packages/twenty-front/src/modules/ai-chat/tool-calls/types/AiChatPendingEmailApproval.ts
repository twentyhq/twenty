import { type ProposedToolCall } from 'twenty-shared/ai';

export type AiChatPendingEmailApproval = {
  toolCallId: string;
  proposal: ProposedToolCall & { template: 'email' };
};
