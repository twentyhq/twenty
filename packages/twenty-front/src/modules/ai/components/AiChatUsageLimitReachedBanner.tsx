import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AiChatInlineBanner } from '@/ai/components/AiChatInlineBanner';
import { useManageUsageLimitsButton } from '@/settings/billing/hooks/useManageUsageLimitsButton';

export const AiChatUsageLimitReachedBanner = () => {
  const { t } = useLingui();

  const manageLimitsButton = useManageUsageLimitsButton();

  return (
    <AiChatInlineBanner
      message={
        isDefined(manageLimitsButton)
          ? t`AI usage limit reached for this period.`
          : t`AI usage limit reached. Ask an admin to raise the limit.`
      }
      button={manageLimitsButton}
    />
  );
};
