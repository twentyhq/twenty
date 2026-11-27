import { useState } from 'react';
import {
  PUBLISH_FRONT_COMPONENT_TOOL_NAME,
  type ProposedToolCall,
  type ToolCallApprovalResponse,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshFrontComponents } from '@/ai-chat/tool-calls/hooks/useRefreshFrontComponents';
import { useAnswerAiChatToolCall } from '@/ai-chat/tool-calls/hooks/useAnswerAiChatToolCall';
import { buildRejectedToolCallOutput } from '@/ai-chat/tool-calls/utils/buildRejectedToolCallOutput';

export const useAnswerToolCallApproval = ({
  toolCallId,
  proposal,
}: {
  toolCallId: string;
  proposal: ProposedToolCall;
}) => {
  const { refreshFrontComponents } = useRefreshFrontComponents();
  const { answerAiChatToolCall } = useAnswerAiChatToolCall();
  const [pendingResponse, setPendingResponse] =
    useState<ToolCallApprovalResponse | null>(null);
  const [isFeedbackShown, setIsFeedbackShown] = useState(false);
  const [feedback, setFeedback] = useState('');

  const answerToolCallApproval = async (response: ToolCallApprovalResponse) => {
    setPendingResponse(response);

    const isAnswered = await answerAiChatToolCall({
      toolCallId,
      response,
      optimisticToolOutput:
        response.decision === 'reject'
          ? buildRejectedToolCallOutput({
              proposal,
              feedback: response.feedback,
            })
          : undefined,
    });

    if (
      isAnswered &&
      response.decision === 'approve' &&
      proposal.toolName === PUBLISH_FRONT_COMPONENT_TOOL_NAME
    ) {
      await refreshFrontComponents();
    }

    if (!isAnswered) {
      setPendingResponse(null);
    }
  };

  const trimmedFeedback = feedback.trim();
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
