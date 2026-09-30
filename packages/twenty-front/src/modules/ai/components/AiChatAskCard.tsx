import { assertUnreachable } from 'twenty-shared/utils';

import { AiChatEmailApprovalCard } from '@/ai/components/AiChatEmailApprovalCard';
import { AiChatQuestionCard } from '@/ai/components/AiChatQuestionCard';
import { type AgentChatPendingAsk } from '@/ai/types/AgentChatPendingAsk';

type AiChatAskCardProps = {
  pendingAsk: AgentChatPendingAsk;
};

export const AiChatAskCard = ({ pendingAsk }: AiChatAskCardProps) => {
  const { id, toolCallId, form } = pendingAsk;

  switch (form.kind) {
    case 'questions':
      return (
        <AiChatQuestionCard
          pendingQuestion={{
            askId: id,
            toolCallId,
            questions: form.questions,
          }}
        />
      );
    case 'emailApproval':
      return (
        <AiChatEmailApprovalCard
          askId={id}
          toolCallId={toolCallId}
          email={form.email}
        />
      );
    default:
      return assertUnreachable(form);
  }
};
