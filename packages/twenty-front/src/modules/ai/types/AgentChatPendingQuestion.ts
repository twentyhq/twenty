import { type AskQuestionItem } from 'twenty-shared/ai';

export type AgentChatPendingQuestion = {
  askId: string;
  toolCallId: string;
  questions: AskQuestionItem[];
};
