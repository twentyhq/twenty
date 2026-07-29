import { useRefreshBillingHasPaymentMethod } from '@/settings/billing/hooks/useRefreshBillingHasPaymentMethod';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { useEffect } from 'react';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

// The cached billingCustomer.hasPaymentMethod flag decides whether trial-time
// actions open the add-credit-card modal; it is only updated by Stripe
// webhooks, so revalidate it where that decision is about to be made
export const BillingHasPaymentMethodRefreshEffect = () => {
  const subscriptionStatus = useSubscriptionStatus();
  const { refreshBillingHasPaymentMethod } =
    useRefreshBillingHasPaymentMethod();

  const isTrialing = subscriptionStatus === SubscriptionStatus.Trialing;

  useEffect(() => {
    if (isTrialing) {
      void refreshBillingHasPaymentMethod();
    }
  }, [isTrialing, refreshBillingHasPaymentMethod]);

  return null;
};
