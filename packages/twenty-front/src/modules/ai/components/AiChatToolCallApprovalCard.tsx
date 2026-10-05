import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AiChatToolWidget } from '@/ai/components/AiChatToolWidget';
import { AiChatToolCallApprovalArgumentsCard } from '@/ai/components/internal/AiChatToolCallApprovalArgumentsCard';
import { AiChatToolCallApprovalEmailCard } from '@/ai/components/internal/AiChatToolCallApprovalEmailCard';
import { useFrontComponentIdByToolName } from '@/ai/hooks/useFrontComponentIdByToolName';

type AiChatToolCallApprovalCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
};

// A tool's own front component reviews its proposed calls, in place of the card its template picks.
export const AiChatToolCallApprovalCard = ({
  toolCallId,
  proposal,
}: AiChatToolCallApprovalCardProps) => {
  const frontComponentId = useFrontComponentIdByToolName().get(
    proposal.toolName,
  );

  const TemplateCard =
    proposal.template === 'email'
      ? AiChatToolCallApprovalEmailCard
      : AiChatToolCallApprovalArgumentsCard;
  const templateCard = (
    <TemplateCard toolCallId={toolCallId} proposal={proposal} />
  );

  return isDefined(frontComponentId) ? (
    <AiChatToolWidget
      toolCall={{
        toolCallId,
        toolName: proposal.toolName,
        status: 'approval-requested',
        input: proposal.arguments,
      }}
      frontComponentId={frontComponentId}
      unavailableFallback={templateCard}
    />
  ) : (
    templateCard
  );
};
