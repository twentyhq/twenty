import { type ReactNode } from 'react';

export type AiChatApprovalMergeSourceRecord = {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarIcon?: ReactNode;
  subtitle?: string;
  content: ReactNode;
};
