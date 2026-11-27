import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useOpenAskAiThread } from '@/ai-chat/threads/hooks/useOpenAskAiThread';
import { buildAskAiThreadRedirectPath } from '@/ai-chat/utils/buildAskAiThreadRedirectPath';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useLocation } from 'react-router-dom';

export const useAiChatEndTrialPeriod = () => {
  const location = useLocation();
  const { threadId } = useAiChatInstanceOrThrow();
  const { openAskAiThread } = useOpenAskAiThread();

  const { endTrialPeriod, isLoading } = useEndSubscriptionTrialPeriod();
  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );

  const finalRedirectPath = buildAskAiThreadRedirectPath({
    pathname: location.pathname,
    search: location.search,
    threadId,
  });

  const endTrialPeriodFromAiChat = async () => {
    await endTrialPeriod({ finalRedirectPath });
  };

  const startSubscriptionAfterPaymentMethodFromAiChat = async () => {
    const { success } = await endTrialPeriod({
      skipPaymentMethodRedirect: true,
    });

    if (success && isNonEmptyString(threadId)) {
      openAskAiThread(threadId);
    }
  };

  return {
    endTrialPeriodFromAiChat,
    startSubscriptionAfterPaymentMethodFromAiChat,
    finalRedirectPath,
    isEndTrialLoading: isLoading,
    hasPaymentMethod: billingHasPaymentMethod,
  };
};
