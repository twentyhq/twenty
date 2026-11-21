import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatErrorMessage } from '@/ai-chat/components/AiChatErrorMessage';
import { useAiChatUserCreditsUsage } from '@/ai-chat/usage/hooks/useAiChatUserCreditsUsage';
import { useCanRetryCurrentAiChatTurn } from '@/ai-chat/messages/hooks/useCanRetryCurrentAiChatTurn';
import { useRetryChatMessage } from '@/ai-chat/messages/hooks/useRetryChatMessage';
import { type AiChatError } from '@/ai-chat/types/AiChatError';

type AiChatUserCreditsExhaustedMessageProps = {
  error: AiChatError;
};

export const AiChatUserCreditsExhaustedMessage = ({
  error,
}: AiChatUserCreditsExhaustedMessageProps) => {
  const { t } = useLingui();

  const { retryChatMessage } = useRetryChatMessage();
  const canRetry = useCanRetryCurrentAiChatTurn();

  const { userCreditsUsage } = useAiChatUserCreditsUsage();

  const canSpendCredits =
    isDefined(userCreditsUsage) &&
    (!userCreditsUsage.isExhausted ||
      userCreditsUsage.isFallingBackToWorkspaceCredits);

  return (
    <AiChatErrorMessage
      error={error}
      hint={
        userCreditsUsage?.isExhausted
          ? t`AI credits renew in ${plural(userCreditsUsage.daysUntilReset, { one: '# day', other: '# days' })}.`
          : undefined
      }
      onRetry={canRetry && canSpendCredits ? retryChatMessage : undefined}
    />
  );
};
