import { type AiChatApprovalReviewStatus } from '@/ai/types/AiChatApprovalReviewStatus';

export type AiChatApprovalReviewRecord = {
  id: string;
  label: string;
  status?: AiChatApprovalReviewStatus;
};
