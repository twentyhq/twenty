import { type AskQuestionItem } from 'twenty-shared/ai';

export type AgentChatPendingQuestion = {
  toolCallId: string;
  questions: AskQuestionItem[];
};
