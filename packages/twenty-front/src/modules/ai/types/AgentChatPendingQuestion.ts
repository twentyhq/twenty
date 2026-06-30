import { type AskQuestionItem } from 'twenty-shared/ai';

export type AgentChatPendingQuestion = {
  messageId: string;
  toolCallId: string;
  questions: AskQuestionItem[];
};
