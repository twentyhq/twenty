import {
  isFrontComponentProposedToolCall,
  type ProposedToolCall,
} from 'twenty-shared/ai';

import { AiChatToolCallApprovalArgumentsCard } from '@/ai/components/internal/AiChatToolCallApprovalArgumentsCard';
import { AiChatToolCallApprovalEmailCard } from '@/ai/components/internal/AiChatToolCallApprovalEmailCard';
import { AiChatToolCallApprovalFrontComponentCard } from '@/ai/components/internal/AiChatToolCallApprovalFrontComponentCard';

type AiChatToolCallApprovalCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
  isActive?: boolean;
};

export const AiChatToolCallApprovalCard = ({
  toolCallId,
  proposal,
  isActive = true,
}: AiChatToolCallApprovalCardProps) => {
  if (isFrontComponentProposedToolCall(proposal)) {
    return (
      <AiChatToolCallApprovalFrontComponentCard
        toolCallId={toolCallId}
        proposal={proposal}
        isActive={isActive}
      />
    );
  }

  return proposal.template === 'email' ? (
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
};
