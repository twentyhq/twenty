import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatErrorMessage } from '@/ai/components/AiChatErrorMessage';
import { type AiChatError } from '@/ai/types/AiChatError';
import { useManageUsageLimitsButton } from '@/settings/billing/hooks/useManageUsageLimitsButton';

type AiChatQuotaLimitExhaustedMessageProps = {
  error: AiChatError;
};

export const AiChatQuotaLimitExhaustedMessage = ({
  error,
}: AiChatQuotaLimitExhaustedMessageProps) => {
  const { t } = useLingui();

  const manageLimitsButton = useManageUsageLimitsButton();

  return (
    <AiChatErrorMessage
      error={error}
      hint={
        isDefined(manageLimitsButton)
          ? undefined
          : t`Ask an admin to raise the limit.`
      }
      button={manageLimitsButton}
    />
  );
};
