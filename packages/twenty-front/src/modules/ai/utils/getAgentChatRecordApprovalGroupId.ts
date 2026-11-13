import { type AiChatPendingRecordApproval } from '@/ai/types/AgentChatPendingRecordApproval';

export const getAiChatRecordApprovalGroupId = ({
  proposal,
}: AiChatPendingRecordApproval) =>
  `${proposal.template}:${proposal.objectNameSingular}`;
