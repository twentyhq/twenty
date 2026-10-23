import { type ReactNode } from 'react';

import { type AiChatApprovalReviewStatus } from '@/ai/types/AiChatApprovalReviewStatus';
import { type AiChatApprovalReviewSummary } from '@/ai/types/AiChatApprovalReviewSummary';

export type AiChatApprovalReviewCard = AiChatApprovalReviewSummary & {
  icon: ReactNode;
  content: ReactNode;
  approveLabel: string;
  status: AiChatApprovalReviewStatus;
  isDestructive?: boolean;
  hint?: string;
  outcomeMessage?: string;
  progress?: { completed: number; total: number };
};
