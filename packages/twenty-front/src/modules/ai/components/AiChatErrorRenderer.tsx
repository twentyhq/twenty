import { t } from '@lingui/core/macro';

import { AiChatApiKeyNotConfiguredMessage } from '@/ai/components/AiChatApiKeyNotConfiguredMessage';
import { AiChatErrorMessage } from '@/ai/components/AiChatErrorMessage';
import { type AiChatError } from '@/ai/types/AiChatError';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { getAiChatQuotaExhaustedKind } from '@/ai/utils/getAiChatQuotaExhaustedKind';
import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type AiChatErrorRendererProps = {
  error: AiChatError;
  onRetry?: () => void;
};

export const AiChatErrorRenderer = ({
  error,
  onRetry,
}: AiChatErrorRendererProps) => {
  // Handled by AIChatNoMoreBillingCreditsBanner, which useHasReachedAiChatCreditsCap
  // keeps mounted for exactly this error so nothing is swallowed here
  if (isAiChatCreditsExhaustedError(error)) {
    return null;
  }

  if (isGraphqlErrorOfType(error, AiChatErrorCode.API_KEY_NOT_CONFIGURED)) {
    return <AiChatApiKeyNotConfiguredMessage />;
  }

  if (isGraphqlErrorOfType(error, AiChatErrorCode.CONTEXT_WINDOW_EXCEEDED)) {
    return <AiChatErrorMessage error={error} />;
  }

  if (isGraphqlErrorOfType(error, AiChatErrorCode.CONNECTION_LOST)) {
    return <AiChatErrorMessage error={error} />;
  }

  // The quota is checked before persistence, so a retry repeats the same refusal
  if (getAiChatQuotaExhaustedKind(error) === 'limit') {
    return (
      <AiChatErrorMessage
        error={error}
        hint={t`Ask a workspace admin to raise the limit.`}
      />
    );
  }

  return <AiChatErrorMessage error={error} onRetry={onRetry} />;
};
