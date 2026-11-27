import { type ReactNode } from 'react';

export type AiChatApprovalReviewCell = {
  value: ReactNode;
  previousValue?: ReactNode;
  isChanged?: boolean;
};
