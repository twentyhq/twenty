import { AiChatApiKeyNotConfiguredMessage } from '@/ai/components/AiChatApiKeyNotConfiguredMessage';
import { AiChatErrorMessage } from '@/ai/components/AiChatErrorMessage';
import { type AiChatError } from '@/ai/types/AiChatError';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type AiChatErrorRendererProps = {
  error: AiChatError;
  onRetry?: () => void;
};

export const AiChatErrorRenderer = ({
  error,
  onRetry,
}: AiChatErrorRendererProps) => {
  if (isGraphqlErrorOfType(error, AiChatErrorCode.BILLING_CREDITS_EXHAUSTED)) {
    // Handled by AIChatNoMoreBillingCreditsBanner, which useHasReachedAiChatCreditsCap
    // keeps mounted for exactly this error so nothing is swallowed here
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

  return <AiChatErrorMessage error={error} onRetry={onRetry} />;
};
