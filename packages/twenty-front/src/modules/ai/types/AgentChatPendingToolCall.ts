import {
  type AskQuestionItem,
  type ProposedEmail,
  type ProposedToolCall,
  type RequestFormField,
} from 'twenty-shared/ai';

export type AgentChatPendingToolCall = { toolCallId: string } & (
  | { kind: 'questions'; questions: AskQuestionItem[] }
  | { kind: 'emailApproval'; email: ProposedEmail }
  | { kind: 'form'; fields: RequestFormField[] }
  | { kind: 'toolCallApproval'; proposal: ProposedToolCall }
);
