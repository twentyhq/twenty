import { AiChatApiKeyNotConfiguredMessage } from '@/ai/components/AiChatApiKeyNotConfiguredMessage';
import { AiChatContinuesOnIncludedModelMessage } from '@/ai/components/AiChatContinuesOnIncludedModelMessage';
import { AiChatErrorMessage } from '@/ai/components/AiChatErrorMessage';
import { AiChatIncludedChatPausedMessage } from '@/ai/components/AiChatIncludedChatPausedMessage';
import { AiChatQuotaLimitExhaustedMessage } from '@/ai/components/AiChatQuotaLimitExhaustedMessage';
import { useAiChatIncludedModel } from '@/ai/hooks/useAiChatIncludedModel';
import { useCanRetryCurrentAiChatTurn } from '@/ai/hooks/useCanRetryCurrentAiChatTurn';
import { useRetryChatMessage } from '@/ai/hooks/useRetryChatMessage';
import { type AiChatError } from '@/ai/types/AiChatError';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { getAiChatQuotaExhaustedKind } from '@/ai/utils/getAiChatQuotaExhaustedKind';
import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';
import { isAiChatIncludedChatPausedError } from '@/ai/utils/isAiChatIncludedChatPausedError';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type AiChatErrorRendererProps = {
  error: AiChatError;
};

export const AiChatErrorRenderer = ({ error }: AiChatErrorRendererProps) => {
  const { retryChatMessage } = useRetryChatMessage();
  const canRetry = useCanRetryCurrentAiChatTurn();
  const { includedModel, isSelectedModelIncluded } = useAiChatIncludedModel();

  if (isAiChatCreditsExhaustedError(error)) {
    // The banner is hidden once the next send runs on the included model, so the cut-off reply needs its own notice
    if (isSelectedModelIncluded) {
      return (
        <AiChatContinuesOnIncludedModelMessage
          includedModelLabel={includedModel?.label}
        />
      );
    }

    // Rendered by AiChatNoMoreBillingCreditsBanner, which stays mounted for this error.
    return null;
  }

  if (isGraphqlErrorOfType(error, AiChatErrorCode.API_KEY_NOT_CONFIGURED)) {
    return <AiChatApiKeyNotConfiguredMessage />;
  }

  if (
    isGraphqlErrorOfType(error, AiChatErrorCode.CONTEXT_WINDOW_EXCEEDED) ||
    isGraphqlErrorOfType(error, AiChatErrorCode.CONNECTION_LOST)
  ) {
    return <AiChatErrorMessage error={error} />;
  }

  if (isAiChatIncludedChatPausedError(error)) {
    return <AiChatIncludedChatPausedMessage error={error} />;
  }

  // The quota is checked before persistence, so a retry repeats the same refusal
  if (getAiChatQuotaExhaustedKind(error) === 'limit') {
    return <AiChatQuotaLimitExhaustedMessage error={error} />;
  }

  return (
    <AiChatErrorMessage
      error={error}
      onRetry={canRetry ? retryChatMessage : undefined}
    />
  );
};
