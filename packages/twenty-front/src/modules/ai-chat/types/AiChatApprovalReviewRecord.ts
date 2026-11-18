import { type AiChatApprovalReviewStatus } from '@/ai-chat/types/AiChatApprovalReviewStatus';

export type AiChatApprovalReviewRecord = {
  id: string;
  label: string;
  status?: AiChatApprovalReviewStatus;
};
