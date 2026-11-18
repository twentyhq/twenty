import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/types/AiChatApprovalReviewEmailDraft';
import { type AiChatApprovalReviewStatus } from '@/ai-chat/types/AiChatApprovalReviewStatus';

export type AiChatApprovalReviewEmail = {
  id: string;
  draft: AiChatApprovalReviewEmailDraft;
  status: AiChatApprovalReviewStatus;
  outcomeMessage?: string;
  progress?: { completed: number; total: number };
};
