import { type ReactNode } from 'react';

import { type AiChatApprovalReviewStatus } from '@/ai-chat/types/AiChatApprovalReviewStatus';
import { type AiChatApprovalReviewSummary } from '@/ai-chat/types/AiChatApprovalReviewSummary';

export type AiChatApprovalReviewCard = AiChatApprovalReviewSummary & {
  icon: ReactNode;
  content: ReactNode;
  approveLabel: string;
  denyLabel?: string;
  status: AiChatApprovalReviewStatus;
  isDestructive?: boolean;
  isApprovalDisabled?: boolean;
  hint?: ReactNode;
  outcomeMessage?: string;
  progress?: { completed: number; total: number };
};
