import { type AskQuestionItem } from 'twenty-shared/ai';

export type AgentChatPendingQuestion = { toolCallId: string } & (
  | { kind: 'question'; question: AskQuestionItem }
  // calls asked before ask_question took one question at a time
  | { kind: 'questions'; questions: AskQuestionItem[] }
);
