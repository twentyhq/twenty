import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmailDraft';
import { type AiChatApprovalReviewStatus } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewStatus';

export type AiChatApprovalReviewEmail = {
  id: string;
  draft: AiChatApprovalReviewEmailDraft;
  status: AiChatApprovalReviewStatus;
  outcomeMessage?: string;
  progress?: { completed: number; total: number };
};
