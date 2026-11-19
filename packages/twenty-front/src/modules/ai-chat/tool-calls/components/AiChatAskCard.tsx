import { assertUnreachable } from 'twenty-shared/utils';

import { AiChatFormCard } from '@/ai-chat/tool-calls/components/AiChatFormCard';
import { AiChatQuestionCard } from '@/ai-chat/tool-calls/components/AiChatQuestionCard';
import { AiChatToolCallApprovalCard } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalCard';
import { type AiChatPendingToolCall } from '@/ai-chat/tool-calls/types/AiChatPendingToolCall';

type AiChatAskCardProps = {
  pendingToolCall: AiChatPendingToolCall;
  isActive?: boolean;
};

export const AiChatAskCard = ({
  pendingToolCall,
  isActive = true,
}: AiChatAskCardProps) => {
  switch (pendingToolCall.kind) {
    case 'question':
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
          isActive={isActive}
        />
      );
    default:
      return assertUnreachable(pendingToolCall);
  }
};
