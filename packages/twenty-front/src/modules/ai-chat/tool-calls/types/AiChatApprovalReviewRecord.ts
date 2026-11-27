import { type AiChatApprovalReviewStatus } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewStatus';

export type AiChatApprovalReviewRecord = {
  id: string;
  label: string;
  status?: AiChatApprovalReviewStatus;
};
