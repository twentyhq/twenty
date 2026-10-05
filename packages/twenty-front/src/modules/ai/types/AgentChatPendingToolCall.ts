import { type ProposedToolCall, type RequestFormField } from 'twenty-shared/ai';

import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';

export type AgentChatPendingToolCall =
  | AgentChatPendingQuestion
  | ({ toolCallId: string } & (
      | { kind: 'form'; fields: RequestFormField[] }
      | { kind: 'toolCallApproval'; proposal: ProposedToolCall }
    ));
