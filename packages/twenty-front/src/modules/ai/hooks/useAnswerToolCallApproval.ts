import { useState } from 'react';
import {
  type ProposeToolCallToolResult,
  type ProposedToolCall,
  type ToolCallApprovalResponse,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';

export const useAnswerToolCallApproval = ({
  toolCallId,
  proposal,
}: {
  toolCallId: string;
  proposal: ProposedToolCall;
}) => {
  const { answerAgentChatToolCall } = useAnswerAgentChatToolCall();
  const [pendingResponse, setPendingResponse] =
    useState<ToolCallApprovalResponse | null>(null);

  const answerToolCallApproval = async (response: ToolCallApprovalResponse) => {
    setPendingResponse(response);

    const isAnswered = await answerAgentChatToolCall({
      toolCallId,
      response,
      // Only a rejection is certain before the server answers: the approved call can still fail.
      optimisticToolOutput:
        response.decision === 'reject'
          ? {
              success: true,
              result: {
                status: 'rejected',
                proposal,
                ...(isDefined(response.feedback)
                  ? { feedback: response.feedback }
                  : {}),
              } satisfies ProposeToolCallToolResult,
            }
          : undefined,
    });

    // The card goes once its call is closed, so it stays disabled until then.
    if (!isAnswered) {
      setPendingResponse(null);
    }
  };

  return {
    pendingResponse,
    isAnswering: pendingResponse !== null,
    answerToolCallApproval,
  };
};
