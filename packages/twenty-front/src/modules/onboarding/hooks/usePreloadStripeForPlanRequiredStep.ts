import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';

import { billingState } from '@/client-config/states/billingState';
import { useIsPlanRequired } from '@/onboarding/hooks/useIsPlanRequired';
import { getStripePromise } from '@/settings/billing/utils/getStripePromise';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const usePreloadStripeForPlanRequiredStep = () => {
  const billing = useAtomStateValue(billingState);
  const isPlanRequired = useIsPlanRequired();

  const publishableKey = billing?.stripePublishableKey;

  useEffect(() => {
    if (isPlanRequired && isNonEmptyString(publishableKey)) {
      void getStripePromise(publishableKey);
    }
  }, [isPlanRequired, publishableKey]);
};
