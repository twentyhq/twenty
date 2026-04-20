import { AiChatApiKeyNotConfiguredMessage } from '@/ai/components/AiChatApiKeyNotConfiguredMessage';
import { AiChatCreditsExhaustedMessage } from '@/ai/components/AiChatCreditsExhaustedMessage';
import { AiChatErrorMessage } from '@/ai/components/AiChatErrorMessage';
import { type AiChatError } from '@/ai/types/AiChatError';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type AiChatErrorRendererProps = {
  error: AiChatError;
};

export const AiChatErrorRenderer = ({ error }: AiChatErrorRendererProps) => {
  if (isGraphqlErrorOfType(error, AiChatErrorCode.BILLING_CREDITS_EXHAUSTED)) {
    return <AiChatCreditsExhaustedMessage />;
  }

  if (isGraphqlErrorOfType(error, AiChatErrorCode.API_KEY_NOT_CONFIGURED)) {
    return <AiChatApiKeyNotConfiguredMessage />;
  }

  return <AiChatErrorMessage error={error} />;
};
