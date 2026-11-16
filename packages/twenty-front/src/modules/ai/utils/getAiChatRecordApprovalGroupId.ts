import { type AiChatPendingRecordApproval } from '@/ai/types/AiChatPendingRecordApproval';

export const getAiChatRecordApprovalGroupId = ({
  proposal,
}: AiChatPendingRecordApproval) =>
  `${proposal.template}:${proposal.objectNameSingular}`;
