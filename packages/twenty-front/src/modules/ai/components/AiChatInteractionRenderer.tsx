import { type ParsedSetuInteractionResult } from 'twenty-shared/ai';

import { AiChatActionReviewCard } from '@/ai/components/AiChatActionReviewCard';
import { AiChatInteractionFallback } from '@/ai/components/AiChatInteractionFallback';
import { AiChatTaskStatusCard } from '@/ai/components/AiChatTaskStatusCard';

type AiChatInteractionRendererProps = {
  interaction: Exclude<ParsedSetuInteractionResult, { status: 'invalid' }>;
};

// Routes a persisted reference to the builtin surface for its kind; the card
// then loads live state, never trusting what the message recorded.
export const AiChatInteractionRenderer = ({
  interaction,
}: AiChatInteractionRendererProps) => {
  if (
    interaction.status === 'valid' &&
    interaction.interaction.kind === 'action-review'
  ) {
    return (
      <AiChatActionReviewCard
        actionRequestId={interaction.interaction.actionRequestId}
      />
    );
  }

  if (
    interaction.status === 'valid' &&
    interaction.interaction.kind === 'task-status'
  ) {
    return <AiChatTaskStatusCard taskId={interaction.interaction.taskId} />;
  }

  return <AiChatInteractionFallback />;
};
