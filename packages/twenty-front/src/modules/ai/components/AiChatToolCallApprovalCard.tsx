import { type ProposedToolCall } from 'twenty-shared/ai';

import { AiChatToolCallApprovalArgumentsCard } from '@/ai/components/internal/AiChatToolCallApprovalArgumentsCard';
import { AiChatToolCallApprovalEmailCard } from '@/ai/components/internal/AiChatToolCallApprovalEmailCard';

type AiChatToolCallApprovalCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
};

export const AiChatToolCallApprovalCard = ({
  toolCallId,
  proposal,
}: AiChatToolCallApprovalCardProps) =>
  proposal.template === 'email' ? (
    <AiChatToolCallApprovalEmailCard
      toolCallId={toolCallId}
      proposal={proposal}
    />
  ) : (
    <AiChatToolCallApprovalArgumentsCard
      toolCallId={toolCallId}
      proposal={proposal}
    />
  );
