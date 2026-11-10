import { isDefined } from 'twenty-shared/utils';

import { type AgentChatPendingRecordApproval } from '@/ai/types/AgentChatPendingRecordApproval';
import { type AgentChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';

export const isAgentChatPendingRecordApproval = (
  pendingToolCall: AgentChatPendingToolCall,
): pendingToolCall is AgentChatPendingToolCall &
  AgentChatPendingRecordApproval => {
  if (pendingToolCall.kind !== 'toolCallApproval') {
    return false;
  }

  const { template, objectNameSingular, recordId } = pendingToolCall.proposal;

  if (!isDefined(objectNameSingular)) {
    return false;
  }

  return (
    template === 'recordCreate' ||
    ((template === 'recordUpdate' || template === 'recordDelete') &&
      isDefined(recordId))
  );
};
