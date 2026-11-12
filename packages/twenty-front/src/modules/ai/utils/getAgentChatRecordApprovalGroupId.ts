import { type AgentChatPendingRecordApproval } from '@/ai/types/AgentChatPendingRecordApproval';

export const getAgentChatRecordApprovalGroupId = ({
  proposal,
}: AgentChatPendingRecordApproval) =>
  `${proposal.template}:${proposal.objectNameSingular}`;
