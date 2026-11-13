import { type ProposedToolCall } from 'twenty-shared/ai';

export type AiChatPendingRecordApproval = {
  toolCallId: string;
  proposal: ProposedToolCall & { objectNameSingular: string } & (
      | { template: 'recordCreate' }
      | { template: 'recordUpdate' | 'recordDelete'; recordId: string }
    );
};
