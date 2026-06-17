import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { CHECKOUT_SESSION_WITH_PAYMENT_METHOD } from '@/settings/billing/graphql/mutations/checkoutSessionWithPaymentMethod';
import { useStripeAppearance } from '@/settings/billing/hooks/useStripeAppearance';
import { useStripePromise } from '@/settings/billing/hooks/useStripePromise';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
} from '~/generated-metadata/graphql';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

type CheckoutSessionWithPaymentMethodMutation = {
  checkoutSession: { clientSecret?: string | null };
};

type CheckoutSessionWithPaymentMethodMutationVariables = {
  recurringInterval: SubscriptionInterval;
  plan: BillingPlanKey;
  requirePaymentMethod: boolean;
  successUrlPath?: string;
};

const SubscriptionPaymentFormContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { enqueueErrorSnackBar } = useSnackBar();
  const billingCheckoutSession = useAtomStateValue(billingCheckoutSessionState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [checkoutSession] = useMutation<
    CheckoutSessionWithPaymentMethodMutation,
    CheckoutSessionWithPaymentMethodMutationVariables
  >(CHECKOUT_SESSION_WITH_PAYMENT_METHOD);

  const handleSubmit = async () => {
    if (!isDefined(stripe) || !isDefined(elements)) {
      return;
    }

    setIsSubmitting(true);

    // Validate and collect the payment details before creating the subscription.
    const { error: submitError } = await elements.submit();
    if (isDefined(submitError)) {
      enqueueErrorSnackBar({
        message:
          submitError.message ??
          t`Your payment details are incomplete. Please review and retry.`,
      });
      setIsSubmitting(false);
      return;
    }

    const { data } = await checkoutSession({
      variables: {
        recurringInterval: billingCheckoutSession.interval,
        plan: billingCheckoutSession.plan,
        requirePaymentMethod: true,
        successUrlPath: AppPath.PlanRequiredSuccess,
      },
    });

    const clientSecret = data?.checkoutSession.clientSecret;
    if (!isDefined(clientSecret)) {
      enqueueErrorSnackBar({
        message: t`Subscription error. Please retry or contact Twenty team`,
      });
      setIsSubmitting(false);
      return;
    }

    const returnUrl = new URL(
      AppPath.PlanRequiredSuccess,
      window.location.origin,
    ).toString();

    const { error } = await stripe.confirmSetup({
      elements,
      clientSecret,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    // Only reached on an immediate confirmation error; otherwise Stripe handles
    // any required authentication and redirects the user to `return_url`.
    if (isDefined(error)) {
      enqueueErrorSnackBar({
        message:
          error.message ??
          t`We couldn't confirm your payment method. Please retry.`,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <StyledFormContainer>
      <PaymentElement
        options={{ fields: { billingDetails: { address: 'never' } } }}
      />
      <StyledButtonContainer>
        <MainButton
          title={t`Continue`}
          onClick={handleSubmit}
          width={200}
          Icon={() => (isSubmitting ? <Loader /> : null)}
          disabled={!isDefined(stripe) || isSubmitting}
        />
      </StyledButtonContainer>
    </StyledFormContainer>
  );
};

export const SubscriptionPaymentForm = () => {
  const stripePromise = useStripePromise();
  const appearance = useStripeAppearance();

  if (!isDefined(stripePromise)) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ mode: 'setup', currency: 'usd', appearance }}
    >
      <SubscriptionPaymentFormContent />
    </Elements>
  );
};
