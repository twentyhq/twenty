import { type AskQuestionItem } from 'twenty-shared/ai';

// The unanswered `ask_questions` tool call on the displayed thread, surfaced as
// the interactive question card that replaces the composer.
export type AgentChatPendingQuestion = {
  messageId: string;
  toolCallId: string;
  questions: AskQuestionItem[];
};
