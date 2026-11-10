import { isDefined } from 'twenty-shared/utils';

import { type AgentChatPendingRecordCreation } from '@/ai/types/AgentChatPendingRecordCreation';
import { type AgentChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';

export const isAgentChatPendingRecordCreation = (
  pendingToolCall: AgentChatPendingToolCall,
): pendingToolCall is AgentChatPendingToolCall &
  AgentChatPendingRecordCreation =>
  pendingToolCall.kind === 'toolCallApproval' &&
  pendingToolCall.proposal.template === 'recordCreate' &&
  isDefined(pendingToolCall.proposal.objectNameSingular);
