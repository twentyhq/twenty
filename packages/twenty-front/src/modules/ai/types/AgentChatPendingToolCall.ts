import {
  type AskQuestionItem,
  type ProposedToolCall,
  type RequestFormField,
} from 'twenty-shared/ai';

export type AgentChatPendingToolCall = { toolCallId: string } & (
  | { kind: 'questions'; questions: AskQuestionItem[] }
  | { kind: 'form'; fields: RequestFormField[] }
  | { kind: 'toolCallApproval'; proposal: ProposedToolCall }
);
