import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';

import { AiChatErrorMessage } from '@/ai/components/AiChatErrorMessage';
import { useAiChatUserCreditsUsage } from '@/ai/hooks/useAiChatUserCreditsUsage';
import { type AiChatError } from '@/ai/types/AiChatError';

type AiChatUserCreditsExhaustedMessageProps = {
  error: AiChatError;
};

export const AiChatUserCreditsExhaustedMessage = ({
  error,
}: AiChatUserCreditsExhaustedMessageProps) => {
  const { t } = useLingui();

  const { userCreditsUsage } = useAiChatUserCreditsUsage();

  return (
    <AiChatErrorMessage
      error={error}
      hint={
        userCreditsUsage?.isExhausted === true
          ? t`AI credits renew in ${plural(userCreditsUsage.daysUntilReset, { one: '# day', other: '# days' })}.`
          : undefined
      }
    />
  );
};
