import { isDefined } from 'twenty-shared/utils';

import { type AiChatPendingRecordApproval } from '@/ai/types/AiChatPendingRecordApproval';
import { type AiChatPendingToolCall } from '@/ai/types/AiChatPendingToolCall';

export const isAiChatPendingRecordApproval = (
  pendingToolCall: AiChatPendingToolCall,
): pendingToolCall is AiChatPendingToolCall & AiChatPendingRecordApproval => {
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
