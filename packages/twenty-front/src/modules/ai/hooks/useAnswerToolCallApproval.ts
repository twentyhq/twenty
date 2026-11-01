import { useState } from 'react';
import {
  PUBLISH_FRONT_COMPONENT_TOOL_NAME,
  type ProposeToolCallToolResult,
  type ProposedToolCall,
  type ToolCallApprovalResponse,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshFrontComponents } from '@/ai/hooks/useRefreshFrontComponents';
import { useAnswerAgentChatToolCall } from '@/ai/hooks/useAnswerAgentChatToolCall';

export const useAnswerToolCallApproval = ({
  toolCallId,
  proposal,
}: {
  toolCallId: string;
  proposal: ProposedToolCall;
}) => {
  const { refreshFrontComponents } = useRefreshFrontComponents();
  const { answerAgentChatToolCall } = useAnswerAgentChatToolCall();
  const [pendingResponse, setPendingResponse] =
    useState<ToolCallApprovalResponse | null>(null);
  const [isFeedbackShown, setIsFeedbackShown] = useState(false);
  const [feedback, setFeedback] = useState('');

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

    if (
      isAnswered &&
      response.decision === 'approve' &&
      proposal.toolName === PUBLISH_FRONT_COMPONENT_TOOL_NAME
    ) {
      await refreshFrontComponents();
    }

    // The card goes once its call is closed, so it stays disabled until then.
    if (!isAnswered) {
      setPendingResponse(null);
    }
  };

  const trimmedFeedback = feedback.trim();
  // feedback goes with either answer, so the agent hears it whatever the person decides
  const feedbackFields =
    trimmedFeedback.length > 0 ? { feedback: trimmedFeedback } : {};

  const approve = (
    approval: Omit<
      Extract<ToolCallApprovalResponse, { decision: 'approve' }>,
      'decision' | 'feedback'
    >,
  ) => {
    void answerToolCallApproval({
      decision: 'approve',
      ...approval,
      ...feedbackFields,
    });
  };

  const reject = () => {
    void answerToolCallApproval({ decision: 'reject', ...feedbackFields });
  };

  return {
    pendingResponse,
    isAnswering: isDefined(pendingResponse),
    isFeedbackShown,
    showFeedback: () => setIsFeedbackShown(true),
    feedback,
    setFeedback,
    approve,
    reject,
  };
};
