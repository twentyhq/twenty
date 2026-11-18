import { type AiChatPendingRecordApproval } from '@/ai-chat/types/AiChatPendingRecordApproval';

export const getAiChatRecordApprovalGroupId = ({
  proposal,
}: AiChatPendingRecordApproval) =>
  `${proposal.template}:${proposal.objectNameSingular}`;
