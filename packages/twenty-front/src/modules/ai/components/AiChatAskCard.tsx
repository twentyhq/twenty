import { assertUnreachable } from 'twenty-shared/utils';

import { AiChatFormCard } from '@/ai/components/AiChatFormCard';
import { AiChatQuestionCard } from '@/ai/components/AiChatQuestionCard';
import { AiChatToolCallApprovalCard } from '@/ai/components/AiChatToolCallApprovalCard';
import { type AgentChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';

type AiChatAskCardProps = {
  pendingToolCall: AgentChatPendingToolCall;
};

export const AiChatAskCard = ({ pendingToolCall }: AiChatAskCardProps) => {
  switch (pendingToolCall.kind) {
    case 'questions':
      return <AiChatQuestionCard pendingQuestion={pendingToolCall} />;
    case 'form':
      return (
        <AiChatFormCard
          toolCallId={pendingToolCall.toolCallId}
          fields={pendingToolCall.fields}
        />
      );
    case 'toolCallApproval':
      return (
        <AiChatToolCallApprovalCard
          toolCallId={pendingToolCall.toolCallId}
          proposal={pendingToolCall.proposal}
        />
      );
    default:
      return assertUnreachable(pendingToolCall);
  }
};
