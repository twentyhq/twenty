import { STATE_BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/auth/constants/StateBillingCheckoutSessionDefaultValue';
import { useHandleCheckoutSession } from '@/billing/hooks/useHandleCheckoutSession';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isDefined } from 'twenty-ui';
import { SubscriptionStatus } from '~/generated/graphql';

export const InformationBannerNoBillingSubscription = () => {
  const subscriptionStatus = useSubscriptionStatus();

  const { handleCheckoutSession, isSubmitting } = useHandleCheckoutSession({
    recurringInterval: STATE_BILLING_CHECKOUT_SESSION_DEFAULT_VALUE.interval,
    plan: STATE_BILLING_CHECKOUT_SESSION_DEFAULT_VALUE.plan,
    requirePaymentMethod: true,
  });

  if (
    subscriptionStatus !== SubscriptionStatus.Canceled &&
    isDefined(subscriptionStatus)
  ) {
    return null;
  }

  return (
    <InformationBanner
      variant="danger"
      message={`Your workspace does not have an active subscription`}
      buttonTitle="Subscribe"
      buttonOnClick={() => handleCheckoutSession()}
      isButtonDisabled={isSubmitting}
    />
  );
};
