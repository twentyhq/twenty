import { type AiChatApprovalReviewColumn } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewColumn';

export type AiChatApprovalReviewFixture = {
  id: string;
  title: string;
  approveVerb: string;
  operation: 'create' | 'update' | 'delete';
  hint?: string;
  columns: readonly AiChatApprovalReviewColumn[];
  records: readonly {
    id: string;
    label: string;
    values: Record<string, string>;
    previousValues?: Record<string, string>;
  }[];
};
