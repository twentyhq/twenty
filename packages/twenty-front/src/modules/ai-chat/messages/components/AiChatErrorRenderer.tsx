import { AiChatApiKeyNotConfiguredMessage } from '@/ai-chat/components/AiChatApiKeyNotConfiguredMessage';
import { AiChatErrorMessage } from '@/ai-chat/components/AiChatErrorMessage';
import { AiChatQuotaLimitExhaustedMessage } from '@/ai-chat/usage/components/AiChatQuotaLimitExhaustedMessage';
import { AiChatUserCreditsExhaustedMessage } from '@/ai-chat/messages/components/AiChatUserCreditsExhaustedMessage';
import { useCanRetryCurrentAiChatTurn } from '@/ai-chat/messages/hooks/useCanRetryCurrentAiChatTurn';
import { useRetryAiChatMessage } from '@/ai-chat/messages/hooks/useRetryAiChatMessage';
import { type AiChatError } from '@/ai-chat/types/AiChatError';
import { AiChatErrorCode } from '@/ai-chat/utils/aiChatErrorCode';
import { getAiChatQuotaExhaustedKind } from '@/ai-chat/usage/utils/getAiChatQuotaExhaustedKind';
import { isAiChatCreditsExhaustedError } from '@/ai-chat/usage/utils/isAiChatCreditsExhaustedError';
import { isAiChatUserCreditsExhaustedError } from '@/ai-chat/usage/utils/isAiChatUserCreditsExhaustedError';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type AiChatErrorRendererProps = {
  error: AiChatError;
};

export const AiChatErrorRenderer = ({ error }: AiChatErrorRendererProps) => {
  const { retryChatMessage } = useRetryAiChatMessage();
  const canRetry = useCanRetryCurrentAiChatTurn();

  if (isAiChatCreditsExhaustedError(error)) {
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

  if (isAiChatUserCreditsExhaustedError(error)) {
    return <AiChatUserCreditsExhaustedMessage error={error} />;
  }

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
