import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatErrorMessage } from '@/ai/components/AiChatErrorMessage';
import { useAiChatUserCreditsUsage } from '@/ai/hooks/useAiChatUserCreditsUsage';
import { type AiChatError } from '@/ai/types/AiChatError';
import { computeDaysUntilReset } from '@/ai/utils/computeDaysUntilReset';

type AiChatUserCreditsExhaustedMessageProps = {
  error: AiChatError;
};

export const AiChatUserCreditsExhaustedMessage = ({
  error,
}: AiChatUserCreditsExhaustedMessageProps) => {
  const { t } = useLingui();

  const { userCreditsUsage } = useAiChatUserCreditsUsage();

  const daysUntilReset = isDefined(userCreditsUsage)
    ? computeDaysUntilReset(userCreditsUsage.periodEnd)
    : null;

  return (
    <AiChatErrorMessage
      error={error}
      hint={
        isDefined(daysUntilReset)
          ? t`AI credits renew in ${plural(daysUntilReset, { one: '# day', other: '# days' })}.`
          : undefined
      }
    />
  );
};
