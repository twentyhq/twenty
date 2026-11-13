import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { buildAskAiThreadRedirectPath } from '@/ai/utils/buildAskAiThreadRedirectPath';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useLocation } from 'react-router-dom';

export const useInboxEndTrialPeriod = () => {
  const location = useLocation();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const { openAskAiThread } = useOpenAskAiThread();

  const { endTrialPeriod, isLoading } = useEndSubscriptionTrialPeriod();
  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );

  const finalRedirectPath = buildAskAiThreadRedirectPath({
    pathname: location.pathname,
    search: location.search,
    threadId: currentInboxThread,
  });

  const endTrialPeriodFromAiChat = async () => {
    await endTrialPeriod({ finalRedirectPath });
  };

  const startSubscriptionAfterPaymentMethodFromAiChat = async () => {
    const { success } = await endTrialPeriod({
      skipPaymentMethodRedirect: true,
    });

    if (success && isNonEmptyString(currentInboxThread)) {
      openAskAiThread(currentInboxThread);
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
