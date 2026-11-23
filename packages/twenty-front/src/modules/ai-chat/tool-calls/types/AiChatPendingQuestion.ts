import { type AskQuestionItem } from 'twenty-shared/ai';

export type AiChatPendingQuestion = { toolCallId: string } & (
  | { kind: 'question'; question: AskQuestionItem }
  | { kind: 'questions'; questions: AskQuestionItem[] }
);
