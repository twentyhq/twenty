import { type ReactNode } from 'react';

import { type AiChatApprovalMergeSourceRecord } from '@/ai-chat/tool-calls/types/AiChatApprovalMergeSourceRecord';
import { type AiChatApprovalReviewStatus } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewStatus';

export type AiChatApprovalMergePair = {
  id: string;
  title: string;
  sources: readonly [
    AiChatApprovalMergeSourceRecord,
    AiChatApprovalMergeSourceRecord,
  ];
  priorityRecordId: string;
  activeTab: 'preview' | 'first' | 'second' | 'settings';
  preview: ReactNode;
  status: AiChatApprovalReviewStatus;
  outcomeMessage?: string;
  progress?: { completed: number; total: number };
};
