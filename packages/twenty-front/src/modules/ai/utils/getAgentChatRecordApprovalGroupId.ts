import { type AgentChatPendingRecordApproval } from '@/ai/types/AgentChatPendingRecordApproval';

export const getInboxRecordApprovalGroupId = ({
  proposal,
}: AgentChatPendingRecordApproval) =>
  `${proposal.template}:${proposal.objectNameSingular}`;
