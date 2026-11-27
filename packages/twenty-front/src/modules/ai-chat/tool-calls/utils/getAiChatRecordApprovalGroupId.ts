import { type AiChatPendingRecordApproval } from '@/ai-chat/tool-calls/types/AiChatPendingRecordApproval';

export const getAiChatRecordApprovalGroupId = ({
  proposal,
}: AiChatPendingRecordApproval) =>
  `${proposal.template}:${proposal.objectNameSingular}`;
