import { type ReactNode } from 'react';

export type AiChatApprovalReviewColumn = {
  id: string;
  label: string;
  icon?: ReactNode;
  width: number;
  align?: 'left' | 'right';
};
