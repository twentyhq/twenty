import {
  PUBLISH_FRONT_COMPONENT_TOOL_NAME,
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
  // Stored publication proposals may predate the frontComponent template.
  if (
    proposal.template === 'frontComponent' ||
    (proposal.template === 'generic' &&
      proposal.toolName === PUBLISH_FRONT_COMPONENT_TOOL_NAME)
  ) {
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
