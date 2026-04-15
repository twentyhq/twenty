import { AIChatApiKeyNotConfiguredMessage } from '@/ai/components/AIChatApiKeyNotConfiguredMessage';
import { AIChatCreditsExhaustedMessage } from '@/ai/components/AIChatCreditsExhaustedMessage';
import { AIChatErrorMessage } from '@/ai/components/AIChatErrorMessage';
import { type AIChatError } from '@/ai/types/AIChatError';
import { AIChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type AIChatErrorRendererProps = {
  error: AIChatError;
};

export const AIChatErrorRenderer = ({ error }: AIChatErrorRendererProps) => {
  if (isGraphqlErrorOfType(error, AIChatErrorCode.BILLING_CREDITS_EXHAUSTED)) {
    return <AIChatCreditsExhaustedMessage />;
  }

  if (isGraphqlErrorOfType(error, AIChatErrorCode.API_KEY_NOT_CONFIGURED)) {
    return <AIChatApiKeyNotConfiguredMessage />;
  }

  return <AIChatErrorMessage error={error} />;
};
