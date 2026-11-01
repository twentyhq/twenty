import { type AiChatApprovalReviewEmailDraft } from '@/ai/types/AiChatApprovalReviewEmailDraft';
import { type AiChatApprovalReviewStatus } from '@/ai/types/AiChatApprovalReviewStatus';

export type AiChatApprovalReviewEmail = {
  id: string;
  draft: AiChatApprovalReviewEmailDraft;
  status: AiChatApprovalReviewStatus;
  outcomeMessage?: string;
  progress?: { completed: number; total: number };
};
