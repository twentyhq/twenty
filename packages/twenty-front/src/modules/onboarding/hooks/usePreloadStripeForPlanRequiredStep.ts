import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { getIsPlanRequired } from '@/onboarding/utils/getIsPlanRequired';
import { getStripePromise } from '@/settings/billing/utils/getStripePromise';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const usePreloadStripeForPlanRequiredStep = () => {
  const billing = useAtomStateValue(billingState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isPlanRequired = getIsPlanRequired({
    isBillingEnabled: billing?.isBillingEnabled ?? false,
    currentWorkspace,
  });

  const publishableKey = billing?.stripePublishableKey;

  useEffect(() => {
    if (isPlanRequired && isNonEmptyString(publishableKey)) {
      void getStripePromise(publishableKey);
    }
  }, [isPlanRequired, publishableKey]);
};
