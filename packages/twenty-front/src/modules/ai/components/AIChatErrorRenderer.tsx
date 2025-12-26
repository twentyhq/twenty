import { AIChatApiKeyNotConfiguredMessage } from '@/ai/components/AIChatApiKeyNotConfiguredMessage';
import { AIChatCreditsExhaustedMessage } from '@/ai/components/AIChatCreditsExhaustedMessage';
import { AIChatErrorMessage } from '@/ai/components/AIChatErrorMessage';
import { isApiKeyNotConfiguredError } from '@/ai/utils/isApiKeyNotConfiguredError';
import { isBillingCreditsExhaustedError } from '@/ai/utils/isBillingCreditsExhaustedError';

type AIChatErrorRendererProps = {
  error: Error;
};

export const AIChatErrorRenderer = ({ error }: AIChatErrorRendererProps) => {
  if (isBillingCreditsExhaustedError(error)) {
    return <AIChatCreditsExhaustedMessage />;
  }

  if (isApiKeyNotConfiguredError(error)) {
    return <AIChatApiKeyNotConfiguredMessage />;
  }

  return <AIChatErrorMessage error={error} />;
};
