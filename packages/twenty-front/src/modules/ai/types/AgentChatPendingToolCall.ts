import { type ProposedToolCall, type RequestFormField } from 'twenty-shared/ai';

import { type AiChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';

export type AiChatPendingToolCall =
  | AiChatPendingQuestion
  | ({ toolCallId: string } & (
      | { kind: 'form'; fields: RequestFormField[] }
      | { kind: 'toolCallApproval'; proposal: ProposedToolCall }
    ));
