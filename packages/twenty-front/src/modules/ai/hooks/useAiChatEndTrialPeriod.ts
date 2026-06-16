import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { buildAskAiThreadRedirectPath } from '@/ai/utils/buildAskAiThreadRedirectPath';
import { billingHasPaymentMethodSelector } from '@/settings/billing/states/billingHasPaymentMethodSelector';
import { useEndSubscriptionTrialPeriod } from '@/settings/billing/hooks/useEndSubscriptionTrialPeriod';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLocation } from 'react-router-dom';

export const useAiChatEndTrialPeriod = () => {
  const location = useLocation();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const { endTrialPeriod, isLoading } = useEndSubscriptionTrialPeriod();
  const billingHasPaymentMethod = useAtomStateValue(
    billingHasPaymentMethodSelector,
  );

  const endTrialPeriodFromAiChat = async () => {
    await endTrialPeriod({
      finalRedirectPath: buildAskAiThreadRedirectPath({
        pathname: location.pathname,
        search: location.search,
        threadId: currentAiChatThread,
      }),
    });
  };

  return {
    endTrialPeriodFromAiChat,
    isEndTrialLoading: isLoading,
    hasPaymentMethod: billingHasPaymentMethod,
  };
};
