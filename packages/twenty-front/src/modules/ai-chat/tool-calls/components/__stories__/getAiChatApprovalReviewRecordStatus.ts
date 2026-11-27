import { type AiChatApprovalReviewStatus } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewStatus';

export const getAiChatApprovalReviewRecordStatus = ({
  status,
  isSelected,
}: {
  status: AiChatApprovalReviewStatus;
  isSelected: boolean;
}): AiChatApprovalReviewStatus | undefined => {
  if (status === 'pending') {
    return undefined;
  }

  if (!isSelected) {
    return 'skipped';
  }

  return status;
};
