import { assertUnreachable } from 'twenty-shared/utils';

import { AiChatEmailApprovalCard } from '@/ai/components/AiChatEmailApprovalCard';
import { AiChatFormCard } from '@/ai/components/AiChatFormCard';
import { AiChatQuestionCard } from '@/ai/components/AiChatQuestionCard';
import { type AgentChatPendingToolCall } from '@/ai/types/AgentChatPendingToolCall';

type AiChatAskCardProps = {
  pendingToolCall: AgentChatPendingToolCall;
};

export const AiChatAskCard = ({ pendingToolCall }: AiChatAskCardProps) => {
  switch (pendingToolCall.kind) {
    case 'questions':
      return <AiChatQuestionCard pendingQuestion={pendingToolCall} />;
    case 'emailApproval':
      return (
        <AiChatEmailApprovalCard
          toolCallId={pendingToolCall.toolCallId}
          email={pendingToolCall.email}
        />
      );
    case 'form':
      return (
        <AiChatFormCard
          toolCallId={pendingToolCall.toolCallId}
          fields={pendingToolCall.fields}
        />
      );
    default:
      return assertUnreachable(pendingToolCall);
  }
};
