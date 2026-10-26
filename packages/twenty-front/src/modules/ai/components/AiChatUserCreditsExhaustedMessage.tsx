import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatErrorMessage } from '@/ai/components/AiChatErrorMessage';
import { useAiChatUserCreditsUsage } from '@/ai/hooks/useAiChatUserCreditsUsage';
import { useCanRetryCurrentAiChatTurn } from '@/ai/hooks/useCanRetryCurrentAiChatTurn';
import { useRetryChatMessage } from '@/ai/hooks/useRetryChatMessage';
import { type AiChatError } from '@/ai/types/AiChatError';

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
